/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ExtendedHeader from 'woocommerce/components/extended-header';
import List from 'woocommerce/components/list/list';
import ListItem from 'woocommerce/components/list/list-item';
import ListHeader from 'woocommerce/components/list/list-header';
import ListItemField from 'woocommerce/components/list/list-item-field';
import LocationFlag from 'woocommerce/components/location-flag';
import { decodeEntities } from 'lib/formatting';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import { getCurrentlyEditingShippingZoneLocationsList } from 'woocommerce/state/ui/shipping/zones/locations/selectors';

const ShippingZoneLocationList = ( { loaded, translate, locations, onChange } ) => {
	const renderLocation = ( location, index ) => {
		if ( ! loaded ) {
			return (
				<ListItem key={ index } className="shipping-zone__location is-placeholder" >
					<ListItemField className="shipping-zone__location-title">
						<div className="shipping-zone__placeholder-flag" />
						<span />
					</ListItemField>
					<ListItemField className="shipping-zone__location-summary">
						<span />
						<span />
					</ListItemField>
					<ListItemField className="shipping-zone__location-actions">
						<Button compact >{ translate( 'Edit' ) }</Button>
					</ListItemField>
				</ListItem>
			);
		}

		return (
			<ListItem key={ index } className="shipping-zone__location" >
				<ListItemField className="shipping-zone__location-title">
					<LocationFlag code={ location.code } />
					{ decodeEntities( location.name ) }
				</ListItemField>
				<ListItemField className="shipping-zone__location-summary">
				</ListItemField>
				<ListItemField className="shipping-zone__location-actions">
					<Button compact >{ translate( 'Edit' ) }</Button>
				</ListItemField>
			</ListItem>
		);
	};

	const onAddLocation = () => {
		if ( ! loaded ) {
			return;
		}
		onChange();
	};

	const locationsToRender = loaded ? locations : [ {}, {}, {} ];

	return (
		<div className="shipping-zone__locations-container">
			<ExtendedHeader
				label={ translate( 'Zone locations' ) }
				description={ translate( 'Add locations that you want to share shipping methods' ) } >
				<Button onClick={ onAddLocation } disabled={ ! loaded } >{ translate( 'Add location' ) }</Button>
			</ExtendedHeader>
			<List>
				<ListHeader>
					<ListItemField className="shipping-zone__location-title">
						{ translate( 'Location' ) }
					</ListItemField>
					<ListItemField className="shipping-zone__location-summary">
						{ translate( 'Details' ) }
					</ListItemField>
				</ListHeader>
				{ locationsToRender.map( renderLocation ) }
			</List>
		</div>
	);
};

ShippingZoneLocationList.PropTypes = {
	siteId: PropTypes.number,
	loaded: PropTypes.bool.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default connect(
	( state, ownProps ) => ( {
		locations: ownProps.loaded && getCurrentlyEditingShippingZoneLocationsList( state ),
	} ),
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId( {
		}, dispatch, ownProps.siteId ),
	} )
)( localize( ShippingZoneLocationList ) );
