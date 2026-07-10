<?php
/**
 * My Bookings
 *
 * Custom customer bookings view for My Account > Bookings.
 *
 * @package Zenctuary
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$booking_groups = array(
	'upcoming' => array(),
	'expired'  => array(),
);
$has_next_page = false;

$current_time = current_time( 'timestamp' );
$cbb_settings = get_option( 'cbb_zencoin_settings', array() );
$cbb_settings = is_array( $cbb_settings ) ? $cbb_settings : array();
$cancel_cutoff_hours = isset( $cbb_settings['on_time_cancel_cutoff_hours'] ) ? absint( $cbb_settings['on_time_cancel_cutoff_hours'] ) : 12;
$book_class_url = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' );
$book_class_url = apply_filters( 'zenctuary_bookings_book_class_url', $book_class_url );

$format_booking_duration = static function ( $booking, $booking_product ) {
	$start_time = method_exists( $booking, 'get_start' ) ? (int) $booking->get_start( 'edit' ) : 0;
	$end_time   = method_exists( $booking, 'get_end' ) ? (int) $booking->get_end( 'edit' ) : 0;

	if ( $start_time <= 0 || $end_time <= $start_time ) {
		return '';
	}

	$minutes = (int) round( ( $end_time - $start_time ) / MINUTE_IN_SECONDS );

	if ( $minutes <= 0 ) {
		return '';
	}

	if ( $booking_product && function_exists( 'is_wc_booking_product' ) && is_wc_booking_product( $booking_product ) ) {
		$duration      = $end_time - $start_time;
		$duration_unit = $booking_product->get_duration_unit();

		if ( 'minute' === $duration_unit ) {
			$duration = $duration / MINUTE_IN_SECONDS;
			$unit     = __( 'min', 'woocommerce-bookings' );
		} elseif ( 'hour' === $duration_unit ) {
			$duration = $duration / HOUR_IN_SECONDS;
			$unit     = _n( 'h', 'hours', $duration, 'woocommerce-bookings' );
		} elseif ( 'day' === $duration_unit ) {
			$duration = $duration / DAY_IN_SECONDS;
			$unit     = _n( 'day', 'days', $duration, 'woocommerce-bookings' );
		} else {
			$unit = $duration_unit;
		}

		return apply_filters( '__experimental_woocommerce_bookings_get_duration', $duration . ' ' . $unit, $duration, $duration_unit );
	}

	return sprintf(
		/* translators: %d: booking duration in minutes */
		__( '%d min', 'zenctuary' ),
		$minutes
	);
};

$escape_ics_text = static function ( $value ) {
	$value = wp_strip_all_tags( (string) $value );
	$value = str_replace( array( '\\', ';', ',', "\r\n", "\n", "\r" ), array( '\\\\', '\;', '\,', '\\n', '\\n', '\\n' ), $value );

	return $value;
};

$create_ics_url = static function ( $booking, $booking_product, $title, $location ) use ( $escape_ics_text ) {
	$start_time = method_exists( $booking, 'get_start' ) ? (int) $booking->get_start( 'edit' ) : 0;
	$end_time   = method_exists( $booking, 'get_end' ) ? (int) $booking->get_end( 'edit' ) : 0;

	if ( $start_time <= 0 || $end_time <= $start_time ) {
		return '';
	}

	$uid_host = wp_parse_url( home_url(), PHP_URL_HOST );
	$uid_host = $uid_host ? $uid_host : 'zenctuary.local';
	$summary  = $escape_ics_text( $title );
	$place    = $escape_ics_text( $location );
	$url      = $booking_product ? get_permalink( $booking_product->get_id() ) : home_url( '/' );

	$ics_lines = array(
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Zenctuary//Bookings//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		'UID:booking-' . absint( $booking->get_id() ) . '@' . $uid_host,
		'DTSTAMP:' . gmdate( 'Ymd\THis\Z' ),
		'DTSTART:' . gmdate( 'Ymd\THis\Z', $start_time ),
		'DTEND:' . gmdate( 'Ymd\THis\Z', $end_time ),
		'SUMMARY:' . $summary,
		'LOCATION:' . $place,
		'DESCRIPTION:' . $escape_ics_text( sprintf( __( 'Booking #%s at Zenctuary.', 'zenctuary' ), $booking->get_id() ) ),
		'URL:' . esc_url_raw( $url ),
		'END:VEVENT',
		'END:VCALENDAR',
	);

	return 'data:text/calendar;charset=utf-8,' . rawurlencode( implode( "\r\n", $ics_lines ) );
};

if ( ! empty( $tables ) ) {
	foreach ( $tables as $table ) {
		$i = 0;
		$has_next_page = $has_next_page || count( $table['bookings'] ) > $bookings_per_page;

		foreach ( $table['bookings'] as $booking ) {
			$i++;

			if ( ! $booking ) {
				continue;
			}

			if ( $i > $bookings_per_page ) {
				break;
			}

			$booking_product = $booking->get_product();
			$product_id      = $booking_product ? $booking_product->get_id() : 0;
			$title           = $booking_product && function_exists( 'is_wc_booking_product' ) && is_wc_booking_product( $booking_product ) ? $booking_product->get_title() : sprintf( __( 'Booking #%s', 'zenctuary' ), $booking->get_id() );
			$start_time      = method_exists( $booking, 'get_start' ) ? (int) $booking->get_start( 'edit' ) : 0;
			$end_time        = method_exists( $booking, 'get_end' ) ? (int) $booking->get_end( 'edit' ) : 0;
			$cancellable     = 'cancelled' !== $booking->get_status() && 'completed' !== $booking->get_status() && ! $booking->passed_cancel_day();
			$is_ongoing      = function_exists( 'zenctuary_is_ongoing_booking' ) && zenctuary_is_ongoing_booking( $booking );
			$status_text     = $is_ongoing ? __( 'Ongoing', 'zenctuary' ) : wc_bookings_get_status_label( $booking->get_status() );
			$is_expired      = ! $is_ongoing && ( in_array( $booking->get_status(), array( 'cancelled', 'completed' ), true ) || ( $end_time > 0 && $end_time < $current_time ) );
			$group_key       = $is_expired ? 'expired' : 'upcoming';

			$coin_cost = $product_id ? get_post_meta( $product_id, '_cbb_booking_coin_cost', true ) : '';

			if ( '' === (string) $coin_cost && $product_id ) {
				$coin_cost = get_post_meta( $product_id, '_zen_coins', true );
			}

			$location = $product_id ? get_post_meta( $product_id, '_zbp_location', true ) : '';

			if ( '' === (string) $location && $product_id ) {
				$space_terms = get_the_terms( $product_id, 'space_type' );
				$location    = ! is_wp_error( $space_terms ) && ! empty( $space_terms ) ? $space_terms[0]->name : '';
			}

			$instructor = $product_id ? get_post_meta( $product_id, '_zen_instructor_name', true ) : '';
			$duration   = $format_booking_duration( $booking, $booking_product );
			$date_label = $start_time > 0 ? wp_date( 'd.m.Y', $start_time ) : '';
			$time_label = $start_time > 0 ? wp_date( 'H:i', $start_time ) : '';
			$time_label = $time_label && $end_time > $start_time ? $time_label . '-' . wp_date( 'H:i', $end_time ) : $time_label;

			if ( $duration ) {
				$time_label = $time_label ? sprintf( '%1$s (%2$s)', $time_label, $duration ) : $duration;
			}

			$is_late_cancellation = $cancel_cutoff_hours > 0 && $start_time > 0 && ( $current_time + ( $cancel_cutoff_hours * HOUR_IN_SECONDS ) ) > $start_time;
			$cancel_modal_title   = $is_late_cancellation ? __( 'Booking is not refundable', 'zenctuary' ) : __( 'Cancel booking?', 'zenctuary' );
			$cancel_modal_message = $is_late_cancellation ? __( 'This booking is no longer refundable. Do you still want to cancel?', 'zenctuary' ) : __( 'Please confirm that you want to cancel this booking.', 'zenctuary' );
			$ics_url              = $create_ics_url( $booking, $booking_product, $title, $location );

			$booking_groups[ $group_key ][] = array(
				'booking'              => $booking,
				'title'                => $title,
				'coin_cost'            => $coin_cost,
				'date_label'           => $date_label,
				'time_label'           => $time_label,
				'location'             => $location,
				'instructor'           => $instructor,
				'status_text'          => $status_text,
				'cancellable'          => $cancellable,
				'cancel_modal_title'   => $cancel_modal_title,
				'cancel_modal_message' => $cancel_modal_message,
				'ics_url'              => $ics_url,
			);
		}
	}
}

$has_bookings = ! empty( $booking_groups['upcoming'] ) || ! empty( $booking_groups['expired'] );
?>

<section class="zen-bookings-panel" data-zen-bookings-panel>
	<header class="zen-bookings-panel__header">
		<button type="button" class="zen-bookings-panel__icon-button" data-zen-bookings-back aria-label="<?php esc_attr_e( 'Go back', 'zenctuary' ); ?>">&larr;</button>
		<h2><?php esc_html_e( 'Bookings', 'woocommerce-bookings' ); ?></h2>
		<a class="zen-bookings-panel__icon-button" href="<?php echo esc_url( wc_get_account_endpoint_url( 'dashboard' ) ); ?>" aria-label="<?php esc_attr_e( 'Close bookings', 'zenctuary' ); ?>">&times;</a>
	</header>

	<nav class="zen-bookings-tabs" aria-label="<?php esc_attr_e( 'Booking filters', 'zenctuary' ); ?>">
		<button type="button" class="zen-bookings-tabs__button is-active" data-zen-bookings-tab="upcoming"><?php esc_html_e( 'Upcoming', 'zenctuary' ); ?></button>
		<button type="button" class="zen-bookings-tabs__button" data-zen-bookings-tab="expired"><?php esc_html_e( 'Expired', 'zenctuary' ); ?></button>
	</nav>

	<div class="zen-bookings-lists">
		<?php foreach ( array( 'upcoming', 'expired' ) as $group_key ) : ?>
			<div class="zen-bookings-list <?php echo 'upcoming' === $group_key ? 'is-active' : ''; ?>" data-zen-bookings-list="<?php echo esc_attr( $group_key ); ?>">
				<?php if ( empty( $booking_groups[ $group_key ] ) ) : ?>
					<div class="zen-bookings-empty">
						<p><?php echo esc_html( 'upcoming' === $group_key ? __( 'No upcoming bookings yet.', 'zenctuary' ) : __( 'No expired bookings yet.', 'zenctuary' ) ); ?></p>
						<?php if ( 'upcoming' === $group_key ) : ?>
							<a class="zen-bookings-empty__button" href="<?php echo esc_url( $book_class_url ); ?>"><?php esc_html_e( 'Book a Class', 'zenctuary' ); ?> <span aria-hidden="true">&rarr;</span></a>
						<?php endif; ?>
					</div>
				<?php else : ?>
					<?php foreach ( $booking_groups[ $group_key ] as $item ) : ?>
						<?php
						$booking         = $item['booking'];
						$cancel_modal_id = 'zbp-booking-cancel-modal-' . $booking->get_id();
						?>
						<article class="zen-booking-card">
							<div class="zen-booking-card__main">
								<div class="zen-booking-card__title-row">
									<h3><?php echo esc_html( $item['title'] ); ?></h3>
									<?php if ( '' !== (string) $item['coin_cost'] ) : ?>
										<span class="zen-booking-card__coin"><?php echo esc_html( wc_format_decimal( $item['coin_cost'], 0 ) ); ?></span>
									<?php endif; ?>
								</div>

								<div class="zen-booking-card__meta">
									<?php if ( $item['date_label'] ) : ?>
										<span class="zen-booking-card__meta-row"><span class="zen-booking-card__meta-icon" aria-hidden="true"></span><?php echo esc_html( $item['date_label'] ); ?></span>
									<?php endif; ?>
									<?php if ( $item['time_label'] ) : ?>
										<span class="zen-booking-card__meta-row"><span class="zen-booking-card__meta-icon is-clock" aria-hidden="true"></span><?php echo esc_html( $item['time_label'] ); ?></span>
									<?php endif; ?>
									<?php if ( $item['location'] ) : ?>
										<span class="zen-booking-card__meta-row"><span class="zen-booking-card__meta-icon is-location" aria-hidden="true"></span><?php echo esc_html( $item['location'] ); ?></span>
									<?php endif; ?>
								</div>

								<?php if ( $item['instructor'] ) : ?>
									<p class="zen-booking-card__instructor"><?php echo esc_html( $item['instructor'] ); ?></p>
								<?php endif; ?>
							</div>

							<div class="zen-booking-card__actions">
								<?php if ( $item['ics_url'] ) : ?>
									<a class="zen-booking-card__button is-calendar" href="<?php echo esc_attr( $item['ics_url'] ); ?>" download="zenctuary-booking-<?php echo esc_attr( $booking->get_id() ); ?>.ics"><?php esc_html_e( 'Add to calendar', 'zenctuary' ); ?></a>
								<?php endif; ?>

								<?php if ( $item['cancellable'] ) : ?>
									<a href="#<?php echo esc_attr( $cancel_modal_id ); ?>" role="button" class="zen-booking-card__button is-cancel" data-zbp-booking-cancel-trigger="<?php echo esc_attr( $cancel_modal_id ); ?>"><?php esc_html_e( 'Cancel Class', 'zenctuary' ); ?></a>
									<div id="<?php echo esc_attr( $cancel_modal_id ); ?>" class="zbp-booking-cancel-overlay" hidden>
										<div class="zbp-booking-cancel-dialog" role="dialog" aria-modal="true" aria-labelledby="<?php echo esc_attr( $cancel_modal_id ); ?>-title">
											<h3 id="<?php echo esc_attr( $cancel_modal_id ); ?>-title"><?php echo esc_html( $item['cancel_modal_title'] ); ?></h3>
											<p><?php echo esc_html( $item['cancel_modal_message'] ); ?></p>
											<div class="zbp-booking-cancel-actions">
												<a href="<?php echo esc_url( $booking->get_cancel_url() ); ?>" class="button zbp-booking-cancel-confirm"><?php esc_html_e( 'Cancel Booking', 'woocommerce-bookings' ); ?></a>
												<button type="button" class="button zbp-booking-cancel-keep" data-zbp-booking-cancel-close><?php esc_html_e( 'Keep Booking', 'zenctuary' ); ?></button>
											</div>
										</div>
									</div>
								<?php else : ?>
									<span class="zen-booking-card__status"><?php echo esc_html( $item['status_text'] ); ?></span>
								<?php endif; ?>
							</div>
						</article>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
		<?php endforeach; ?>
	</div>

	<?php if ( $has_bookings ) : ?>
		<?php do_action( 'woocommerce_before_account_bookings_pagination' ); ?>
		<div class="woocommerce-pagination woocommerce-pagination--without-numbers woocommerce-Pagination zen-bookings-pagination">
			<?php if ( 1 !== $page ) : ?><a class="woocommerce-button woocommerce-button--previous woocommerce-Button woocommerce-Button--previous button" href="<?php echo esc_url( wc_get_endpoint_url( 'bookings', $page - 1 ) ); ?>"><?php esc_html_e( 'Previous', 'woocommerce-bookings' ); ?></a><?php endif; ?>
			<?php if ( $has_next_page ) : ?><a class="woocommerce-button woocommerce-button--next woocommerce-Button woocommerce-Button--next button" href="<?php echo esc_url( wc_get_endpoint_url( 'bookings', $page + 1 ) ); ?>"><?php esc_html_e( 'Next', 'woocommerce-bookings' ); ?></a><?php endif; ?>
		</div>
		<?php do_action( 'woocommerce_after_account_bookings_pagination' ); ?>
	<?php endif; ?>
</section>

<style>
	.zen-bookings-panel {
		background: radial-gradient(circle at 28% 20%, rgba(216, 179, 85, 0.22), transparent 28%), linear-gradient(150deg, #3F3E3E 0%, #171917 100%);
		border-radius: 22px;
		box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
		box-sizing: border-box;
		color: #f6f2ea;
		margin: 0 auto;
		max-width: 920px;
		min-height: 560px;
		padding: 26px;
		width: 100%;
	}

	.zen-bookings-panel * {
		box-sizing: border-box;
	}

	.zen-bookings-panel__header {
		align-items: center;
		display: grid;
		grid-template-columns: 44px 1fr 44px;
		margin-bottom: 28px;
	}

	.zen-bookings-panel__header h2 {
		color: #f6f2ea;
		font-size: 18px;
		font-weight: 800;
		line-height: 1.2;
		margin: 0;
		text-align: center;
	}

	.zen-bookings-panel__icon-button {
		align-items: center;
		background: transparent;
		border: 2px solid rgba(246, 242, 234, 0.62);
		border-radius: 999px;
		color: #d7d4ce;
		cursor: pointer;
		display: inline-flex;
		font-size: 28px;
		height: 34px;
		justify-content: center;
		line-height: 1;
		text-decoration: none;
		width: 34px;
	}

	.zen-bookings-tabs {
		align-items: center;
		display: inline-flex;
		gap: 8px;
		margin-bottom: 28px;
	}

	.zen-bookings-tabs__button {
		background: transparent;
		border: 2px solid #9A9A9A;
		border-radius: 999px;
		color: #f6f2ea;
		cursor: pointer;
		font-size: 14px;
		font-weight: 700;
		line-height: 1;
		min-height: 38px;
		padding: 0 24px;
	}

	.zen-bookings-tabs__button.is-active {
		background: #D8B355;
		border-color: #D8B355;
		color: #3F3E3E;
	}

	.zen-bookings-list {
		display: none;
		flex-direction: column;
		gap: 18px;
	}

	.zen-bookings-list.is-active {
		display: flex;
	}

	.zen-booking-card {
		align-items: stretch;
		border: 2px solid #9A9A9A;
		border-radius: 22px;
		display: grid;
		gap: 24px;
		grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
		padding: 22px;
		width: 100%;
	}

	.zen-booking-card__title-row {
		align-items: flex-start;
		display: flex;
		gap: 16px;
		justify-content: space-between;
	}

	.zen-booking-card h3 {
		color: #f6f2ea;
		font-size: 18px;
		font-weight: 800;
		line-height: 1.3;
		margin: 0;
		max-width: 640px;
		text-transform: uppercase;
	}

	.zen-booking-card__coin {
		align-items: center;
		background: #D8B355;
		border: 4px double #3F3E3E;
		border-radius: 999px;
		color: #3F3E3E;
		display: inline-flex;
		flex: 0 0 auto;
		font-size: 18px;
		font-weight: 800;
		height: 46px;
		justify-content: center;
		width: 46px;
	}

	.zen-booking-card__meta {
		display: grid;
		gap: 10px;
		margin-top: 18px;
	}

	.zen-booking-card__meta-row {
		align-items: center;
		color: #f6f2ea;
		display: flex;
		font-size: 15px;
		gap: 10px;
		line-height: 1.35;
	}

	.zen-booking-card__meta-icon {
		background: #D8B355;
		border-radius: 3px;
		display: inline-block;
		flex: 0 0 auto;
		height: 14px;
		width: 14px;
	}

	.zen-booking-card__meta-icon.is-clock {
		border-radius: 999px;
	}

	.zen-booking-card__meta-icon.is-location {
		clip-path: polygon(50% 0, 100% 35%, 72% 100%, 28% 100%, 0 35%);
	}

	.zen-booking-card__instructor {
		color: #bdb8ad;
		font-size: 14px;
		line-height: 1.4;
		margin: 16px 0 0;
	}

	.zen-booking-card__actions {
		align-self: center;
		display: flex;
		flex-direction: column;
		gap: 10px;
		justify-content: center;
		min-width: 0;
	}

	.zen-booking-card__button,
	.zen-booking-card__status {
		align-items: center;
		background: transparent;
		border: 2px solid currentColor;
		border-radius: 999px;
		color: #9A9A9A;
		display: inline-flex;
		font-size: 14px;
		font-weight: 800;
		justify-content: center;
		line-height: 1.1;
		min-height: 44px;
		padding: 10px 18px;
		text-align: center;
		text-decoration: none;
		width: 100%;
	}

	.zen-booking-card__button.is-cancel {
		color: #D8B355;
	}

	.zen-booking-card__button:hover,
	.zen-booking-card__button:focus {
		background: rgba(255, 255, 255, 0.04);
		color: currentColor;
	}

	.zen-bookings-empty {
		display: grid;
		gap: 24px;
		justify-items: start;
		padding: 26px 0;
	}

	.zen-bookings-empty p {
		color: #f6f2ea;
		font-size: 16px;
		font-weight: 700;
		margin: 0;
	}

	.zen-bookings-empty__button {
		align-items: center;
		background: #D8B355;
		border-radius: 999px;
		color: #3F3E3E;
		display: inline-flex;
		font-size: 18px;
		font-weight: 800;
		gap: 10px;
		justify-content: center;
		min-height: 56px;
		padding: 0 34px;
		text-decoration: none;
	}

	.zen-bookings-pagination {
		margin-top: 26px;
	}

	.zbp-booking-cancel-overlay {
		align-items: center;
		background: rgba(0, 0, 0, 0.72);
		display: flex;
		inset: 0;
		justify-content: center;
		padding: 24px;
		position: fixed;
		z-index: 100000;
	}

	.zbp-booking-cancel-overlay[hidden] {
		display: none;
	}

	.zbp-booking-cancel-dialog {
		background: #3F3E3E;
		border-radius: 12px;
		box-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
		color: #f6f2ea;
		max-width: 540px;
		padding: 48px 32px 36px;
		text-align: center;
		width: min(100%, 540px);
	}

	.zbp-booking-cancel-dialog h3 {
		color: #D8B355;
		font-size: 28px;
		font-weight: 700;
		line-height: 1.25;
		margin: 0 0 18px;
	}

	.zbp-booking-cancel-dialog p {
		color: #f6f2ea;
		font-size: 20px;
		line-height: 1.45;
		margin: 0 0 34px;
	}

	.zbp-booking-cancel-actions {
		display: flex;
		flex-direction: column;
		gap: 34px;
	}

	.zbp-booking-cancel-actions .button,
	.zbp-booking-cancel-actions a.button,
	.zbp-booking-cancel-actions button.button {
		align-items: center;
		background: transparent;
		border: 3px solid currentColor;
		border-radius: 999px;
		box-sizing: border-box;
		display: inline-flex;
		font-size: 24px;
		font-weight: 700;
		justify-content: center;
		line-height: 1.2;
		min-height: 88px;
		padding: 18px 28px;
		text-align: center;
		text-decoration: none;
		width: 100%;
	}

	.zbp-booking-cancel-confirm,
	.zbp-booking-cancel-confirm:visited {
		color: #D8B355;
	}

	.zbp-booking-cancel-keep,
	.zbp-booking-cancel-keep:visited {
		color: #9A9A9A;
	}

	.zbp-booking-cancel-confirm:hover,
	.zbp-booking-cancel-confirm:focus,
	.zbp-booking-cancel-keep:hover,
	.zbp-booking-cancel-keep:focus {
		background: rgba(255, 255, 255, 0.04);
		color: currentColor;
	}

	@media (max-width: 781px) {
		.zen-bookings-panel {
			border-radius: 16px;
			max-width: 390px;
			min-height: 640px;
			padding: 18px;
		}

		.zen-bookings-panel__header {
			margin-bottom: 24px;
		}

		.zen-bookings-tabs {
			margin-bottom: 26px;
		}

		.zen-booking-card {
			border-radius: 20px;
			display: block;
			padding: 18px;
		}

		.zen-booking-card h3 {
			font-size: 15px;
		}

		.zen-booking-card__coin {
			height: 42px;
			width: 42px;
		}

		.zen-booking-card__actions {
			margin-top: 18px;
		}
	}

	@media (max-width: 640px) {
		.zbp-booking-cancel-dialog {
			padding: 34px 20px 26px;
		}

		.zbp-booking-cancel-dialog h3 {
			font-size: 22px;
		}

		.zbp-booking-cancel-dialog p {
			font-size: 17px;
		}

		.zbp-booking-cancel-actions {
			gap: 20px;
		}

		.zbp-booking-cancel-actions .button,
		.zbp-booking-cancel-actions a.button,
		.zbp-booking-cancel-actions button.button {
			font-size: 18px;
			min-height: 64px;
		}
	}
</style>

<script>
	document.addEventListener('DOMContentLoaded', function () {
		document.addEventListener('click', function (event) {
			var tab = event.target.closest('[data-zen-bookings-tab]');
			var back = event.target.closest('[data-zen-bookings-back]');
			var trigger = event.target.closest('[data-zbp-booking-cancel-trigger]');
			var close = event.target.closest('[data-zbp-booking-cancel-close]');
			var overlay = event.target.classList && event.target.classList.contains('zbp-booking-cancel-overlay') ? event.target : null;

			if (tab) {
				event.preventDefault();
				var panel = tab.closest('[data-zen-bookings-panel]');
				var target = tab.getAttribute('data-zen-bookings-tab');

				if (panel && target) {
					panel.querySelectorAll('[data-zen-bookings-tab]').forEach(function (button) {
						button.classList.toggle('is-active', button === tab);
					});
					panel.querySelectorAll('[data-zen-bookings-list]').forEach(function (list) {
						list.classList.toggle('is-active', list.getAttribute('data-zen-bookings-list') === target);
					});
				}

				return;
			}

			if (back) {
				event.preventDefault();
				if (window.history.length > 1) {
					window.history.back();
				}
				return;
			}

			if (trigger) {
				event.preventDefault();
				event.stopImmediatePropagation();
				var modal = document.getElementById(trigger.getAttribute('data-zbp-booking-cancel-trigger'));
				if (modal) {
					modal.hidden = false;
				}
				return;
			}

			if (close || overlay) {
				var modalToClose = event.target.closest('.zbp-booking-cancel-overlay');
				if (modalToClose) {
					modalToClose.hidden = true;
				}
			}
		}, true);

		document.addEventListener('keydown', function (event) {
			if (event.key !== 'Escape') {
				return;
			}

			document.querySelectorAll('.zbp-booking-cancel-overlay:not([hidden])').forEach(function (modal) {
				modal.hidden = true;
			});
		});
	});
</script>