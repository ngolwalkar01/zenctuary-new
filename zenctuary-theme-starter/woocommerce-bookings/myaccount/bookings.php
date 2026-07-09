<?php
/**
 * My Bookings
 *
 * Shows customer bookings on the My Account > Bookings page.
 * Theme override merges ongoing bookings into Today and labels them as Ongoing.
 *
 * @package Zenctuary
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$columns_to_display = apply_filters( '__experimental_woocommerce_bookings_my_account_columns', array( 'booking-id', 'booked-product', 'order-number', 'booking-start-date', 'booking-end-date', 'booking-status', 'booking-cancel' ) );

if ( ! empty( $tables ) ) : ?>

	<div class="bookings-my-account-notice"></div>

	<?php if ( count( $tables ) > 0 ) : ?>
		<h2><?php esc_html_e( 'Bookings', 'woocommerce-bookings' ); ?></h2>
	<?php endif; ?>

	<?php foreach ( $tables as $table ) :
		$i = 0;
	?>

		<h3><?php echo esc_html( $table['header'] ); ?></h3>

		<table class="shop_table shop_table_responsive my_account_bookings">
			<thead>
				<tr>
					<?php if ( in_array( 'booking-id', $columns_to_display, true ) ) : ?><th scope="col" class="booking-id"><?php esc_html_e( 'ID', 'woocommerce-bookings' ); ?></th><?php endif; ?>
					<?php if ( in_array( 'booked-product', $columns_to_display, true ) ) : ?><th scope="col" class="booked-product"><?php esc_html_e( 'Booked', 'woocommerce-bookings' ); ?></th><?php endif; ?>
					<?php if ( in_array( 'order-number', $columns_to_display, true ) ) : ?><th scope="col" class="order-number"><?php esc_html_e( 'Order', 'woocommerce-bookings' ); ?></th><?php endif; ?>
					<?php if ( in_array( 'booking-start-date', $columns_to_display, true ) ) : ?><th scope="col" class="booking-start-date"><?php esc_html_e( 'Start Date', 'woocommerce-bookings' ); ?></th><?php endif; ?>
					<?php if ( in_array( 'booking-end-date', $columns_to_display, true ) ) : ?><th scope="col" class="booking-end-date"><?php esc_html_e( 'End Date', 'woocommerce-bookings' ); ?></th><?php endif; ?>
					<?php if ( in_array( 'booking-date', $columns_to_display, true ) ) : ?><th scope="col" class="booking-date"><?php esc_html_e( 'Date', 'woocommerce-bookings' ); ?></th><?php endif; ?>
					<?php if ( in_array( 'booking-status', $columns_to_display, true ) ) : ?><th scope="col" class="booking-status"><?php esc_html_e( 'Status', 'woocommerce-bookings' ); ?></th><?php endif; ?>
					<?php if ( in_array( 'booking-total', $columns_to_display, true ) ) : ?><th scope="col" class="booking-total"><?php esc_html_e( 'Total', 'woocommerce-bookings' ); ?></th><?php endif; ?>
					<?php if ( in_array( 'booking-cancel', $columns_to_display, true ) ) : ?>
						<th scope="col" class="booking-cancel"><span class="screen-reader-text"><?php esc_html_e( 'Actions', 'woocommerce-bookings' ); ?></span></th>
					<?php endif; ?>
				</tr>
			</thead>
			<tbody>
			<?php foreach ( $table['bookings'] as $booking ) :
				$i++;
				if ( ! $booking ) {
					continue;
				}
				if ( $i > $bookings_per_page ) {
					break;
				}

				$booking_product    = $booking->get_product();
				$formatted_duration = '';

				if ( $booking_product && is_wc_booking_product( $booking_product ) ) {
					$duration      = $booking->get_end() - $booking->get_start();
					$duration_unit = $booking_product->get_duration_unit();

					if ( 'minute' === $duration_unit ) {
						$duration     = $duration / 60;
						$unit_display = __( 'min', 'woocommerce-bookings' );
					} elseif ( 'hour' === $duration_unit ) {
						$duration     = $duration / 3600;
						$unit_display = _n( 'h', 'hours', $duration, 'woocommerce-bookings' );
					} elseif ( 'day' === $duration_unit ) {
						$duration     = $duration / 86400;
						$unit_display = _n( 'day', 'days', $duration, 'woocommerce-bookings' );
					} elseif ( 'month' === $duration_unit ) {
						$duration     = (int) round( $duration / 2592000 );
						$unit_display = _n( 'month', 'months', $duration, 'woocommerce-bookings' );
					} else {
						$unit_display = $duration_unit;
					}

					$formatted_duration = apply_filters( '__experimental_woocommerce_bookings_get_duration', $duration . ' ' . $unit_display, $duration, $duration_unit );
				}
				$cancellable = 'cancelled' !== $booking->get_status() && 'completed' !== $booking->get_status() && ! $booking->passed_cancel_day();
				$is_ongoing  = function_exists( 'zenctuary_is_ongoing_booking' ) && zenctuary_is_ongoing_booking( $booking );
				$status_text = $is_ongoing ? __( 'Ongoing', 'zenctuary' ) : wc_bookings_get_status_label( $booking->get_status() );

				$cbb_settings           = get_option( 'cbb_zencoin_settings', array() );
				$cbb_settings           = is_array( $cbb_settings ) ? $cbb_settings : array();
				$cancel_cutoff_hours    = isset( $cbb_settings['on_time_cancel_cutoff_hours'] ) ? absint( $cbb_settings['on_time_cancel_cutoff_hours'] ) : 12;
				$booking_start_time     = method_exists( $booking, 'get_start' ) ? (int) $booking->get_start( 'edit' ) : 0;
				$is_late_cancellation   = $cancel_cutoff_hours > 0 && $booking_start_time > 0 && ( current_time( 'timestamp' ) + ( $cancel_cutoff_hours * HOUR_IN_SECONDS ) ) > $booking_start_time;
				$cancel_modal_title     = $is_late_cancellation ? __( 'Booking is not refundable', 'zenctuary' ) : __( 'Cancel booking?', 'zenctuary' );
				$cancel_modal_message   = $is_late_cancellation ? __( 'This booking is no longer refundable. Do you still want to cancel?', 'zenctuary' ) : __( 'Please confirm that you want to cancel this booking.', 'zenctuary' );
			?>
				<tr>
					<?php if ( in_array( 'booking-id', $columns_to_display, true ) ) : ?><th scope="row" data-title="<?php esc_html_e( 'ID', 'woocommerce-bookings' ); ?>" class="booking-id"><?php echo esc_html( $booking->get_id() ); ?></th><?php endif; ?>
					<?php if ( in_array( 'booked-product', $columns_to_display, true ) ) : ?>
						<td data-title="<?php esc_html_e( 'Booked', 'woocommerce-bookings' ); ?>" class="booked-product"><?php if ( $booking_product && is_wc_booking_product( $booking_product ) ) : ?><a href="<?php echo esc_url( get_permalink( $booking_product->get_id() ) ); ?>"><?php echo esc_html( $booking_product->get_title() ); ?></a><?php endif; ?></td>
					<?php endif; ?>
					<?php if ( in_array( 'order-number', $columns_to_display, true ) ) : ?><td data-title="<?php esc_html_e( 'Order', 'woocommerce-bookings' ); ?>" class="order-number"><?php if ( $booking->get_order() ) : ?><a href="<?php echo esc_url( $booking->get_order()->get_view_order_url() ); ?>"><?php echo esc_html( $booking->get_order()->get_order_number() ); ?></a><?php endif; ?></td><?php endif; ?>
					<?php if ( in_array( 'booking-start-date', $columns_to_display, true ) ) : ?><td data-title="<?php esc_html_e( 'Start Date', 'woocommerce-bookings' ); ?>" class="booking-start-date" data-all-day="<?php echo esc_attr( $booking->is_all_day() ? 'yes' : 'no' ); ?>" data-timezone="<?php echo esc_attr( $booking->get_booking_timezone() ); ?>"><?php echo esc_html( $booking->get_start_date( null, null, wc_should_convert_timezone( $booking ) ) ); ?></td><?php endif; ?>
					<?php if ( in_array( 'booking-end-date', $columns_to_display, true ) ) : ?><td data-title="<?php esc_html_e( 'End Date', 'woocommerce-bookings' ); ?>" class="booking-end-date" data-all-day="<?php echo esc_attr( $booking->is_all_day() ? 'yes' : 'no' ); ?>" data-timezone="<?php echo esc_attr( $booking->get_booking_timezone() ); ?>"><?php echo esc_html( $booking->get_end_date( null, null, wc_should_convert_timezone( $booking ) ) ); ?></td><?php endif; ?>
					<?php if ( in_array( 'booking-date', $columns_to_display, true ) ) : ?><td data-title="<?php esc_html_e( 'Date', 'woocommerce-bookings' ); ?>" class="booking-date" data-all-day="<?php echo esc_attr( $booking->is_all_day() ? 'yes' : 'no' ); ?>" data-timezone="<?php echo esc_attr( $booking->get_booking_timezone() ); ?>"><?php echo esc_html( $booking->get_start_date( null, '', wc_should_convert_timezone( $booking ) ) ) . ', <span class="booking-date-time">' . esc_html( $booking->get_start_date( '', null, wc_should_convert_timezone( $booking ) ) ) . '</span>' . ( $formatted_duration ? ' <span class="booking-date-duration">(' . esc_html( $formatted_duration ) . ')</span>' : '' ); ?></td><?php endif; ?>
					<?php if ( in_array( 'booking-status', $columns_to_display, true ) ) : ?><td data-title="<?php esc_html_e( 'Status', 'woocommerce-bookings' ); ?>" class="booking-status"><span class="wc-bookings-status-label"><?php echo esc_html( $status_text ); ?></span></td><?php endif; ?>
					<?php if ( in_array( 'booking-total', $columns_to_display, true ) ) : ?><td data-title="<?php esc_html_e( 'Total', 'woocommerce-bookings' ); ?>" class="booking-total"><?php echo wp_kses_post( wc_price( $booking->get_cost() ) ); ?></td><?php endif; ?>
					<?php if ( in_array( 'booking-cancel', $columns_to_display, true ) ) : ?>
						<td data-title="<?php esc_html_e( 'Cancel', 'woocommerce-bookings' ); ?>" class="booking-cancel <?php echo $cancellable ? 'cancellable' : 'not-cancellable'; ?>">
							<?php if ( $cancellable ) : ?>
								<?php $cancel_modal_id = 'zbp-booking-cancel-modal-' . $booking->get_id(); ?>
								<a href="#<?php echo esc_attr( $cancel_modal_id ); ?>" role="button" class="button zbp-booking-cancel-button" data-zbp-booking-cancel-trigger="<?php echo esc_attr( $cancel_modal_id ); ?>"><?php esc_html_e( 'Cancel', 'woocommerce-bookings' ); ?></a>
								<div id="<?php echo esc_attr( $cancel_modal_id ); ?>" class="zbp-booking-cancel-overlay" hidden>
									<div class="zbp-booking-cancel-dialog" role="dialog" aria-modal="true" aria-labelledby="<?php echo esc_attr( $cancel_modal_id ); ?>-title">
										<h3 id="<?php echo esc_attr( $cancel_modal_id ); ?>-title"><?php echo esc_html( $cancel_modal_title ); ?></h3>
										<p><?php echo esc_html( $cancel_modal_message ); ?></p>
										<div class="zbp-booking-cancel-actions">
											<a href="<?php echo esc_url( $booking->get_cancel_url() ); ?>" class="button zbp-booking-cancel-confirm"><?php esc_html_e( 'Cancel Booking', 'woocommerce-bookings' ); ?></a>
											<button type="button" class="button zbp-booking-cancel-keep" data-zbp-booking-cancel-close><?php esc_html_e( 'Keep Booking', 'zenctuary' ); ?></button>
										</div>
									</div>
								</div>
							<?php endif; ?>
						</td>
					<?php endif; ?>
				</tr>
			<?php endforeach; ?>
			</tbody>
		</table>

		<?php do_action( 'woocommerce_before_account_bookings_pagination' ); ?>

		<div class="woocommerce-pagination woocommerce-pagination--without-numbers woocommerce-Pagination">
			<?php if ( 1 !== $page ) : ?><a class="woocommerce-button woocommerce-button--previous woocommerce-Button woocommerce-Button--previous button" href="<?php echo esc_url( wc_get_endpoint_url( 'bookings', $page - 1 ) ); ?>"><?php esc_html_e( 'Previous', 'woocommerce-bookings' ); ?></a><?php endif; ?>
			<?php if ( count( $table['bookings'] ) > $bookings_per_page ) : ?><a class="woocommerce-button woocommerce-button--next woocommerce-Button woocommerce-Button--next button" href="<?php echo esc_url( wc_get_endpoint_url( 'bookings', $page + 1 ) ); ?>"><?php esc_html_e( 'Next', 'woocommerce-bookings' ); ?></a><?php endif; ?>
		</div>

		<?php do_action( 'woocommerce_after_account_bookings_pagination' ); ?>

	<?php endforeach; ?>

	<style>
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
				var trigger = event.target.closest('[data-zbp-booking-cancel-trigger]');
				var close = event.target.closest('[data-zbp-booking-cancel-close]');
				var overlay = event.target.classList && event.target.classList.contains('zbp-booking-cancel-overlay') ? event.target : null;

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
<?php else : ?>
	<div class="woocommerce-Message woocommerce-Message--info woocommerce-info">
		<a class="woocommerce-Button button" href="<?php echo esc_url( apply_filters( 'woocommerce_return_to_shop_redirect', wc_get_page_permalink( 'shop' ) ) ); ?>"><?php esc_html_e( 'Go Shop', 'woocommerce-bookings' ); ?></a>
		<?php esc_html_e( 'No bookings available yet.', 'woocommerce-bookings' ); ?>
	</div>
<?php endif; ?>
