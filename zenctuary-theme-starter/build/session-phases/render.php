<?php
/**
 * Server-side render for zenctuary/session-phases block.
 *
 * @package Zenctuary
 */

$cards_str = $attributes['cardsData'] ?? '';
$cards     = json_decode( $cards_str, true );

if ( ! is_array( $cards ) || empty( $cards ) ) {
	$cards = [
		[
			'title'       => 'PHASE 1: Activation',
			'titleIcon'   => [ 'id' => 0, 'url' => '', 'alt' => '' ],
			'timeText'    => '3–4 min',
			'timeIcon'    => [ 'id' => 0, 'url' => '', 'alt' => '' ],
			'pointsText'  => 'Breathwork · Presence · Intention',
			'borderColor' => '#c6b36a',
		],
		[
			'title'       => 'PHASE 2: Ice Immersion',
			'titleIcon'   => [ 'id' => 0, 'url' => '', 'alt' => '' ],
			'timeText'    => '3–5 min',
			'timeIcon'    => [ 'id' => 0, 'url' => '', 'alt' => '' ],
			'pointsText'  => 'Icebath · Presence · Breathing',
			'borderColor' => '#c6b36a',
		],
		[
			'title'       => 'PHASE 3: Afterdrop',
			'titleIcon'   => [ 'id' => 0, 'url' => '', 'alt' => '' ],
			'timeText'    => '10–15 min',
			'timeIcon'    => [ 'id' => 0, 'url' => '', 'alt' => '' ],
			'pointsText'  => 'Movement · Presence · Breathing',
			'borderColor' => '#c6b36a',
		],
		[
			'title'       => 'PHASE 4: Fire Integration',
			'titleIcon'   => [ 'id' => 0, 'url' => '', 'alt' => '' ],
			'timeText'    => '10–15 min',
			'timeIcon'    => [ 'id' => 0, 'url' => '', 'alt' => '' ],
			'pointsText'  => 'Sauna · Heat · Relaxation',
			'borderColor' => '#c6b36a',
		],
		[
			'title'       => 'PHASE 5: Reflection',
			'titleIcon'   => [ 'id' => 0, 'url' => '', 'alt' => '' ],
			'timeText'    => '5 min',
			'timeIcon'    => [ 'id' => 0, 'url' => '', 'alt' => '' ],
			'pointsText'  => 'Sit · Breath · Arrive',
			'borderColor' => '#c6b36a',
		],
	];
}

// ── Build global CSS variables ──────────────────────────────────────────────
$css_vars = [
	'--zsp-bg'          => sanitize_hex_color( $attributes['sectionBgColor']    ?? '#3a3b38' ),
	'--zsp-pt'          => absint( $attributes['sectionPaddingTop']    ?? 80 ) . 'px',
	'--zsp-pb'          => absint( $attributes['sectionPaddingBottom'] ?? 80 ) . 'px',
	'--zsp-px'          => absint( $attributes['sectionPaddingX']      ?? 60 ) . 'px',
	'--zsp-max-w'       => absint( $attributes['sectionMaxWidth']      ?? 1200 ) . 'px',

	'--zsp-h-fs'        => absint( $attributes['headingFontSize']      ?? 36 ) . 'px',
	'--zsp-h-fw'        => esc_attr( $attributes['headingFontWeight']  ?? '600' ),
	'--zsp-h-lh'        => floatval( $attributes['headingLineHeight']  ?? 1.2 ),
	'--zsp-h-tt'        => esc_attr( $attributes['headingTextTransform'] ?? 'uppercase' ),
	'--zsp-h-c'         => sanitize_hex_color( $attributes['headingColor'] ?? '#c6b36a' ),
	'--zsp-h-mw'        => absint( $attributes['headingMaxWidth']      ?? 800 ) . 'px',
	'--zsp-gap-hd'      => absint( $attributes['gapBelowHeading']      ?? 24 ) . 'px',

	'--zsp-d-fs'        => absint( $attributes['descFontSize']         ?? 16 ) . 'px',
	'--zsp-d-fw'        => esc_attr( $attributes['descFontWeight']     ?? '400' ),
	'--zsp-d-lh'        => floatval( $attributes['descLineHeight']     ?? 1.5 ),
	'--zsp-d-c'         => sanitize_hex_color( $attributes['descColor'] ?? '#e5e5e5' ),
	'--zsp-d-mw'        => absint( $attributes['descMaxWidth']         ?? 1000 ) . 'px',
	'--zsp-gap-dd'      => absint( $attributes['gapBelowDesc']         ?? 48 ) . 'px',

	'--zsp-cards-gap'   => absint( $attributes['cardsGap']             ?? 24 ) . 'px',
	'--zsp-card-br'     => absint( $attributes['cardBorderRadius']     ?? 12 ) . 'px',
	'--zsp-card-pad'    => absint( $attributes['cardPadding']          ?? 24 ) . 'px',
	'--zsp-card-bw'     => absint( $attributes['cardBorderWidth']      ?? 1 ) . 'px',
	'--zsp-card-bg'     => sanitize_hex_color( $attributes['cardBgColor'] ?? '' ) ?: 'transparent',
	'--zsp-card-mh'     => absint( $attributes['cardMinHeight']        ?? 200 ) . 'px',

	'--zsp-t-fs'        => absint( $attributes['titleFontSize']        ?? 18 ) . 'px',
	'--zsp-t-fw'        => esc_attr( $attributes['titleFontWeight']    ?? '600' ),
	'--zsp-t-lh'        => floatval( $attributes['titleLineHeight']    ?? 1.3 ),
	'--zsp-t-c'         => sanitize_hex_color( $attributes['titleColor'] ?? '#c6b36a' ),
	'--zsp-t-mw'        => absint( $attributes['titleMaxWidth']        ?? 150 ) . 'px',
	'--zsp-gap-ti'      => absint( $attributes['gapTitleIcon']         ?? 12 ) . 'px',
	'--zsp-ti-sz'       => absint( $attributes['titleIconSize']        ?? 40 ) . 'px',

	'--zsp-time-fs'     => absint( $attributes['timeFontSize']         ?? 14 ) . 'px',
	'--zsp-time-fw'     => esc_attr( $attributes['timeFontWeight']     ?? '400' ),
	'--zsp-time-c'      => sanitize_hex_color( $attributes['timeColor'] ?? '#e5e5e5' ),
	'--zsp-tii-sz'      => absint( $attributes['timeIconSize']         ?? 16 ) . 'px',
	'--zsp-gap-tit'     => absint( $attributes['gapTimeIconText']      ?? 8 ) . 'px',

	'--zsp-p-fs'        => absint( $attributes['pointsFontSize']       ?? 14 ) . 'px',
	'--zsp-p-fw'        => esc_attr( $attributes['pointsFontWeight']   ?? '400' ),
	'--zsp-p-lh'        => floatval( $attributes['pointsLineHeight']   ?? 1.5 ),
	'--zsp-p-c'         => sanitize_hex_color( $attributes['pointsColor'] ?? '#ffffff' ),

	'--zsp-gap-tr'      => absint( $attributes['gapTitleRowTimeRow']   ?? 16 ) . 'px',
	'--zsp-gap-tp'      => absint( $attributes['gapTimeRowPointsRow']  ?? 12 ) . 'px',
];

$inline_style = implode( '; ', array_map(
	fn( $k, $v ) => "{$k}: {$v}",
	array_keys( $css_vars ),
	array_values( $css_vars )
) );

// ── Alignment class ──────────────────────────────────────────────────────────
$align_class   = ! empty( $attributes['align'] ) ? 'align' . $attributes['align'] : 'alignfull';
$wrapper_class = "zenctuary-session-phases {$align_class}";
?>
<section class="<?php echo esc_attr( $wrapper_class ); ?>" style="<?php echo esc_attr( $inline_style ); ?>">
	<div class="zsp-inner">
		<div class="zsp-content">

			<?php if ( ! empty( $attributes['headingText'] ) ) : ?>
				<h2 class="zsp-heading"><?php echo esc_html( $attributes['headingText'] ); ?></h2>
			<?php endif; ?>

			<?php if ( ! empty( $attributes['descText'] ) ) : ?>
				<p class="zsp-desc"><?php echo esc_html( $attributes['descText'] ); ?></p>
			<?php endif; ?>

			<div class="zsp-grid">
				<?php foreach ( $cards as $card ) :
					$border_color = sanitize_hex_color( $card['borderColor'] ?? '#c6b36a' );
					$card_style   = $border_color ? "border-color: {$border_color};" : '';

					$title_icon = is_array( $card['titleIcon'] ?? null ) ? $card['titleIcon'] : [];
					$ti_url     = esc_url( $title_icon['url'] ?? '' );
					$ti_alt     = esc_attr( $title_icon['alt'] ?? '' );

					$time_icon  = is_array( $card['timeIcon'] ?? null ) ? $card['timeIcon'] : [];
					$tii_url    = esc_url( $time_icon['url'] ?? '' );
					$tii_alt    = esc_attr( $time_icon['alt'] ?? '' );

					$title  = esc_html( $card['title']      ?? '' );
					$time   = esc_html( $card['timeText']   ?? '' );
					$points = esc_html( $card['pointsText'] ?? '' );
				?>
					<article class="zsp-card" style="<?php echo esc_attr( $card_style ); ?>">

						<!-- Title Row -->
						<div class="zsp-card__title-row">
							<?php if ( $title ) : ?>
								<h3 class="zsp-card__title"><?php echo $title; ?></h3>
							<?php endif; ?>
							<?php if ( $ti_url ) : ?>
								<img class="zsp-card__title-icon" src="<?php echo $ti_url; ?>" alt="<?php echo $ti_alt; ?>" loading="lazy" />
							<?php endif; ?>
						</div>

						<!-- Time Row -->
						<?php if ( $time ) : ?>
							<div class="zsp-card__time-row">
								<?php if ( $tii_url ) : ?>
									<img class="zsp-card__time-icon" src="<?php echo $tii_url; ?>" alt="<?php echo $tii_alt; ?>" loading="lazy" />
								<?php endif; ?>
								<p class="zsp-card__time-text"><?php echo $time; ?></p>
							</div>
						<?php endif; ?>

						<!-- Points / Description -->
						<?php if ( $points ) : ?>
							<p class="zsp-card__points"><?php echo $points; ?></p>
						<?php endif; ?>

					</article>
				<?php endforeach; ?>
			</div>

		</div>
	</div>
</section>
