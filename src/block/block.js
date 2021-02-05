/**
 * BLOCK: guten-slider
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

//  Import CSS.
import './editor.scss';
import './style.scss';

const { registerBlockType } = wp.blocks; // Import registerBlockType() from wp.blocks
const { MediaUpload, InspectorControls } = wp.blockEditor;	
const { Button, CheckboxControl } = wp.components;	
import { Panel, PanelBody, PanelRow } from '@wordpress/components';

import Slider from "react-slick";

/**
 * Register: aa Gutenberg Block.
 *
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made editor as an option to any
 * editor interface where blocks are implemented.
 *
 * @link https://wordpress.org/gutenberg/handbook/block-api/
 * @param  {string}   name     Block name.
 * @param  {Object}   settings Block settings.
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */
registerBlockType( 'cgb/block-guten-slider', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: wp.i18n.__( 'Gutenberg Image Slider' ), // Block title.
	icon: 'upload', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'common', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	attributes: {
		images: {
			type: 'array',
			default: null
		},
		width: {
			type: 'number',
			default: 550
		},
		showDots: {
			type: 'boolean',
			default: true
		},
		showArrows: {
			type: 'boolean',
			default: true
		}
	},

	/**
	 * The edit function describes the structure of your block in the context of the editor.
	 * This represents what the editor will render when the block is used.
	 *
	 * The "edit" property must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 *
	 * @param {Object} props Props.
	 * @returns {Mixed} JSX Component.
	 */
	edit: ( {className, attributes, setAttributes} ) => {
		const onFileSelect = data => {
			console.log(data);
			const images = data.map(media=>{
				const photo_url = wp.media.attachment(media.id).get('photo-url');
				if ( media.type === 'image' ) {
					return {
						id: media.id,
						alt: media.alt,
						src: media.sizes.full.url,
						type: media.type,
						caption: media.caption,
						photo_url: photo_url
					}
				} else if ( media.type === 'video' ) {
					return {
						id: media.id,
						alt: media.alt,
						src: media.url,
						type: media.type,
						caption: media.caption,
						photo_url: photo_url
					}
				}
			});
			console.log(images);
			setAttributes({ images });
		}

		const setShowDots = showDots => {
			setAttributes({ showDots });
		}
		
		const setShowArrows = showArrows => {
			setAttributes({ showArrows });
		}
 
		return ([

			<InspectorControls>
				<PanelBody title="Slider Settings">
					<CheckboxControl
						key="dots"
						label="Show dots"
						help="Show dots for navigating between slides."
						checked={ attributes.showDots }
						onChange={ setShowDots }
						/>
					<CheckboxControl
						key="arrows"
						label="Show arrows"
						help="Show arrows for navigating between slides."
						checked={ attributes.showArrows }
						onChange={ setShowArrows }
					/>
				</PanelBody>
			</InspectorControls>,			
			<div className={ className }>
				<MediaUpload
					multiple
					gallery
					addToGallery
					allowedTypes = {[ 'image', 'video' ]}
					onSelect={ onFileSelect }
					render={({open}) => 
						<button
						className="button-primary"
						style={{marginBottom: '5px'}}
						onClick={ open } >
							{
								attributes.images !== null ?
								"Edit Media" :
								"Add Media"
							}
						</button>
				} />
				{
					attributes.images !== null ?
					<Slider {...{
						dots: attributes.showDots,
						arrows: attributes.showArrows,
						autoplay: true,
						autoplaySpeed: 2000,
						pauseOnHover: true, 
						pauseOnDotsHover: true,
						infinite: true,
						speed: 500,
						slidesToShow: 1,
						slidesToScroll: 1,
						variableWidth: true,
						adaptiveHeight: true,
						beforeChange: (current, next) => {
							const currentElement = document.querySelector(`[data-index="${current}"]`);
							const currentVideo = currentElement.querySelector('video.slide_main');
							const nextElement = document.querySelector(`[data-index="${next}"]`);
							const nextVideo = nextElement.querySelector('video.slide_main');
							
							if ( currentVideo != null ) {
								currentVideo.pause();
							}
							
							if ( nextVideo != null ) {
								nextVideo.play();
							}
					
						},
					}}>
						{attributes.images.map(medium=>{
							console.log(medium);
							console.log("Heya");
							if ( medium.type === 'image' ) {
								
								return (

									<div  className="slide" key={medium.id}>
										{
											( medium.photo_url != "") ?
											<a href={medium.photo_url} target="_blank" rel="noopener">
												<img className="slide_main" src={medium.src} alt={medium.alt} />
											</a> : <img className="slide_main" src={medium.src} alt={medium.alt} />
										}
										<p className="slide_caption">{ medium.caption }</p>
									</div>
								)
							}
							else if ( medium.type === 'video' ) {
								return (
									<div className="slide" key={medium.id}>
										{
											( medium.photo_url != "") ?
											<a href={medium.photo_url} target="_blank" rel="noopener">
												<video controls controlsList="nodownload nofullscreen" className="slide_main" src={medium.src} alt={medium.alt} />
											</a> : <video controls controlsList="nodownload nofullscreen" className="slide_main" src={medium.src} alt={medium.alt} />
										}
										<p className="slide_caption">{ medium.caption }</p>
									</div>
								)
							}
							else{
								return <p>Invalid Element</p>
							}
						})}
					</Slider> :
					<p>Click the button below to add items to the slideshow</p>
				}

			</div>
		]);
	},

	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 *
	 * @param {Object} props Props.
	 * @returns {Mixed} JSX Frontend HTML.
	 */
	save: ({ attributes }) => {
		console.log(attributes);
		return (
			<div className={ attributes.className }>
				{
					attributes.images !== null ?
					<div id="slideshow" data-dots={attributes.showDots} data-arrows={attributes.showArrows} >
						{attributes.images.map(medium=>{
							console.log(medium);
							console.log("Heya");
							if ( medium.type === 'image' ) {
								
								return (

									<div className="slide" key={medium.id}>
										{
											( medium.photo_url != "") ?
											<a target="_blank" href={medium.photo_url} rel="noopener">
												<img className="slide_main" src={medium.src} alt={medium.alt} />
											</a> : <img className="slide_main" src={medium.src} alt={medium.alt} />
										}
										<p className="slide_caption">{ medium.caption }</p>
									</div>
								)
							}
							else if ( medium.type === 'video' ) {
								return (
									<div className="slide" key={medium.id}>
										{
											( medium.photo_url != "") ?
											<a target="_blank" href={medium.photo_url} rel="noopener">
												<video controls controlsList="nodownload nofullscreen" className="slide_main" src={medium.src} alt={medium.alt} />
											</a> : <video controls controlsList="nodownload nofullscreen" className="slide_main" src={medium.src} alt={medium.alt} />
										}
										<p className="slide_caption">{ medium.caption }</p>
									</div>
								)
							}
							else{
								return <p>Invalid Element</p>
							}
						})}
					</div> :
					<p>Add items to the slideshow</p>
				}
			</div>
		
		);
	},
} );

// $('video').on('click', function(){
// 	this.paused ? this.play() : this.pause();
// })