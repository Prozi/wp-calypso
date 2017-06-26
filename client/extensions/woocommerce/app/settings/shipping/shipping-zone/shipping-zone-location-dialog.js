/* eslint wpcalypso/i18n-ellipsis: 0 */
/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import ShippingZoneLocationDialogCountries from './shipping-zone-location-dialog-countries';
import ShippingZoneLocationDialogSettings from './shipping-zone-location-dialog-settings';

const ShippingZoneLocationDialog = ( { siteId, isVisible, translate, onChange } ) => {
	if ( ! isVisible ) {
		return null;
	}

	const onCancel = () => {};
	const onClose = () => {
		onChange();
	};

	const buttons = [
		{ action: 'cancel', label: translate( 'Cancel' ) },
		{ action: 'add', label: translate( 'Save' ), onClick: onClose, isPrimary: true },
	];

	return (
		<Dialog
			additionalClassNames="shipping-zone__location-dialog woocommerce"
			isVisible={ isVisible }
			buttons={ buttons }
			onClose={ onCancel } >
			<div className="shipping-zone__location-dialog-header">
				{ translate( 'Edit location' ) }
			</div>
			<ShippingZoneLocationDialogCountries siteId={ siteId } />
			<ShippingZoneLocationDialogSettings siteId={ siteId } />
		</Dialog>
	);
};

ShippingZoneLocationDialog.propTypes = {
	siteId: PropTypes.number,
	onChange: PropTypes.func.isRequired,
};

export default localize( ShippingZoneLocationDialog );
