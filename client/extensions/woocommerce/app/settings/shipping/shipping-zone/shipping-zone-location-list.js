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
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import { getCurrentlyEditingShippingZoneCountries } from 'woocommerce/state/ui/shipping/zones/locations/selectors';

const ShippingZoneLocationList = ( { loaded, translate, onChange } ) => {
	const renderLoaction = ( method, index ) => {
		if ( ! loaded ) {
			return (
				<ListItem key={ index } className="shipping-zone__location is-placeholder" >
					<ListItemField className="shipping-zone__location-title">
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

	const locationsToRender = [ {}, {}, {} ];

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
				{ locationsToRender.map( renderLoaction ) }
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
	( state ) => ( {
		countries: getCurrentlyEditingShippingZoneCountries( state ),
	} ),
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId( {
		}, dispatch, ownProps.siteId ),
	} )
)( localize( ShippingZoneLocationList ) );
