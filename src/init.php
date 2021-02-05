<?php
/**
 * Blocks Initializer
 *
 * Enqueue CSS/JS of all the blocks.
 *
 * @since   1.0.0
 * @package CGB
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue Gutenberg block assets for both frontend + backend.
 *
 * Assets enqueued:
 * 1. blocks.style.build.css - Frontend + Backend.
 * 2. blocks.build.js - Backend.
 * 3. blocks.editor.build.css - Backend.
 *
 * @uses {wp-blocks} for block type registration & related functions.
 * @uses {wp-element} for WP Element abstraction — structure of blocks.
 * @uses {wp-i18n} to internationalize the block's text.
 * @uses {wp-editor} for WP editor styles.
 * @since 1.0.0
 */
function guten_slider_cgb_block_assets() { // phpcs:ignore
	// Register block styles for both frontend + backend.
	wp_register_style(
		'guten_slider-cgb-style-css', // Handle.
		plugins_url( 'dist/blocks.style.build.css', dirname( __FILE__ ) ), // Block style CSS.
		is_admin() ? array( 'wp-editor' ) : null, // Dependency to include the CSS after it.
		filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.style.build.css' ) // Version: File modification time.
	);

	// Register block editor script for backend.
	wp_register_script(
		'guten_slider-cgb-block-js', // Handle.
		plugins_url( '/dist/blocks.build.js', dirname( __FILE__ ) ), // Block.build.js: We register the block here. Built with Webpack.
		array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor', 'jquery' ), // Dependencies, defined above.
		filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.build.js' ), // Version: filemtime — Gets file modification time.
		false // Enqueue the script in the footer.
	);



	// Register block editor styles for backend.
	wp_register_style(
		'guten_slider-cgb-block-editor-css', // Handle.
		plugins_url( 'dist/blocks.editor.build.css', dirname( __FILE__ ) ), // Block editor CSS.
		array( 'wp-edit-blocks' ), // Dependency to include the CSS after it.
		filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.editor.build.css' ) // Version: File modification time.
	);

	// WP Localized globals. Use dynamic PHP stuff in JavaScript via `cgbGlobal` object.
	wp_localize_script(
		'guten_slider-cgb-block-js',
		'cgbGlobal', // Array containing dynamic data for a JS Global.
		[
			'pluginDirPath' => plugin_dir_path( __DIR__ ),
			'pluginDirUrl'  => plugin_dir_url( __DIR__ ),
			// Add more data here that you want to access from `cgbGlobal` object.
		]
	);

	/**
	 * Register Gutenberg block on server-side.
	 *
	 * Register the block on server-side to ensure that the block
	 * scripts and styles for both frontend and backend are
	 * enqueued when the editor loads.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/blocks/writing-your-first-block-type#enqueuing-block-scripts
	 * @since 1.16.0
	 */
	register_block_type(
		'cgb/block-guten-slider', array(
			// Enqueue blocks.style.build.css on both frontend & backend.
			'style'         => 'guten_slider-cgb-style-css',
			// Enqueue blocks.build.js in the editor only.
			'editor_script' => 'guten_slider-cgb-block-js',
			// 'script' => 'guten_slider_frontend',
			// Enqueue blocks.editor.build.css in the editor only.
			'editor_style'  => 'guten_slider-cgb-block-editor-css',
			
		)
	);

	wp_enqueue_style( 'slick', 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css', array(), true, 'all' );
	wp_enqueue_style( 'slick-theme', 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css', array(), true, 'all' );
}

// Hook: Block assets.
add_action( 'init', 'guten_slider_cgb_block_assets' );

add_action('wp_enqueue_scripts','enqueue_if_block_is_present');

function enqueue_if_block_is_present(){
  if(is_singular()){
     //We only want the script if it's a singular page
     $id = get_the_ID();
     if(has_block('cgb/block-guten-slider',$id)){
		// Register block editor script for backend.
		wp_enqueue_script(
			'slick', // Handle.
			'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js', // Block.build.js: We register the block here. Built with Webpack.
			array( 'jquery' ), // Dependencies, defined above.
			true, // Version: filemtime — Gets file modification time.
			false // Enqueue the script in the footer.
		);
		wp_enqueue_script(
			'guten_slider_frontend', // Handle.
			plugins_url( '/dist/frontend.js', dirname( __FILE__ ) ), // Block.build.js: We register the block here. Built with Webpack.
			array( 'jquery', 'slick' ), // Dependencies, defined above.
			filemtime( plugin_dir_path( __DIR__ ) . 'dist/frontend.js' ), // Version: filemtime — Gets file modification time.
			true // Enqueue the script in the footer.
		);
	}
  }
}

function attachment_field_url( $form_fields, $post ) {
	$form_fields['photo-url'] = array(
		'label' => 'Slide URL',
		'input' => 'text',
		'value' => get_post_meta( $post->ID, 'photo-url', true ),
		'helps' => 'If provided, a click on the slide will redirect to the specified URL.',
	);
	
	return $form_fields;
}

add_filter( 'attachment_fields_to_edit', 'attachment_field_url', 10, 2 );


function attachment_field_url_save( $post, $attachment ) {

	if( isset( $attachment['photo-url'] ) )
		update_post_meta( $post['ID'], 'photo-url', $attachment['photo-url'] );
		
	return $post;
}

add_filter( 'attachment_fields_to_save', 'attachment_field_url_save', 10, 2 );

add_filter( 'wp_prepare_attachment_for_js', 'prepare_attachment_for_js', 10, 3 );

function prepare_attachment_for_js(  $response, $attachment, $meta ) {
    $response[ 'photo-url' ] = get_post_meta( $attachment->ID, 'photo-url', true );
    return $response;
}
