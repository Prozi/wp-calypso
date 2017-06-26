/* eslint wpcalypso/i18n-ellipsis: 0 */
/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FilteredList from 'woocommerce/components/filtered-list';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormTextArea from 'components/forms/form-textarea';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import { decodeEntities } from 'lib/formatting';
import {
	canLocationsBeFiltered,
	canLocationsBeFilteredByState,
	areLocationsFilteredByPostcode,
	areLocationsFilteredByState,
	getCurrentlyEditingShippingZoneStates,
} from 'woocommerce/state/ui/shipping/zones/locations/selectors';
import {
	filterByWholeCountry,
	filterByState,
	filterByPostcode,
	toggleStateSelected,
	editPostcode,
} from 'woocommerce/state/ui/shipping/zones/locations/actions';

const ShippingZoneLocationDialogSettings = ( {
		canFilter,
		filteredByPostcode,
		canFilterByState,
		filteredByState,
		states,
		translate,
		actions,
	} ) => {
	const onWholeCountrySelect = ( event ) => {
		event.stopPropagation();
		actions.filterByWholeCountry();
	};
	const onStateSelect = ( event ) => {
		event.stopPropagation();
		actions.filterByState();
	};
	const onPostcodeSelect = ( event ) => {
		event.stopPropagation();
		actions.filterByPostcode();
	};

	const renderRadios = () => {
		if ( ! canFilter ) {
			return (
				<div>
					<FormRadio disabled={ true } checked={ true } readOnly={ true } />
					{ translate( 'Include entire countries in the zone' ) }
				</div>
			);
		}

		const radios = [
			<div key={ 0 } onClick={ onWholeCountrySelect }>
				<FormRadio
					onChange={ onWholeCountrySelect }
					checked={ ! filteredByPostcode && ! filteredByState } />
				{ translate( 'Include entire country in the zone' ) }
			</div>,
			<div key={ 1 } onClick={ onPostcodeSelect }>
				<FormRadio
					onChange={ onPostcodeSelect }
					checked={ filteredByPostcode } />
				{ translate( 'Include specific postcodes in the zone' ) }
			</div>,
		];

		if ( canFilterByState ) {
			radios.push(
				<div key={ 2 } onClick={ onStateSelect }>
					<FormRadio
						onChange={ onStateSelect }
						checked={ filteredByState } />
					{ translate( 'Include specific states in the zone' ) }
				</div>
			);
		}

		return radios;
	};

	const renderState = ( state, index ) => {
		const { name, selected, code, disabled } = state;

		const onToggle = ( event ) => {
			event.stopPropagation();
			if ( ! selected && disabled ) {
				return;
			}
			actions.toggleStateSelected( code, ! selected );
		};

		return (
			<li key={ index } className="shipping-zone__location-dialog-list-item" onClick={ onToggle }>
				<FormCheckbox
					onChange={ onToggle }
					className="shipping-zone__location-dialog-list-item-checkbox"
					checked={ selected }
					disabled={ ! selected && disabled } />
				{ decodeEntities( name ) }
			</li>
		);
	};

	const renderDetailedSettings = () => {
		if ( filteredByPostcode ) {
			const onPostcodeChange = () => ( actions.editPostcode() );

			return (
				<FormFieldSet>
					<FormLabel>{ translate( 'Post codes' ) }</FormLabel>
					<FormTextArea
						onChange={ onPostcodeChange }
						placeholder={ translate( 'List 1 postcode per line.' ) } />
					<p>
						{ translate( 'Postcodes containing wildcards (e.g. CB23*) ' +
							'and fully numeric ranges (e.g. 90210...99000) are also supported.' ) }
					</p>
				</FormFieldSet>
			);
		}

		if ( filteredByState ) {
			return (
				<FormFieldSet>
					<FormLabel>{ translate( 'States' ) }</FormLabel>
					<FilteredList
						items={ states }
						filterBy="name"
						renderItem={ renderState }
						placeholder={ translate( 'Filter by state from the list below' ) } />
				</FormFieldSet>
			);
		}

		return null;
	};

	return (
		<div>
			<FormFieldSet>
				<FormLabel>{ translate( 'Shipping Zone settings' ) }</FormLabel>
				{ renderRadios() }
			</FormFieldSet>
			{ renderDetailedSettings() }
		</div>
	);
};

ShippingZoneLocationDialogSettings.propTypes = {
	siteId: PropTypes.number,
};

export default connect(
	( state ) => ( {
		canFilter: canLocationsBeFiltered( state ),
		canFilterByState: canLocationsBeFilteredByState( state ),
		filteredByPostcode: areLocationsFilteredByPostcode( state ),
		filteredByState: areLocationsFilteredByState( state ),
		states: getCurrentlyEditingShippingZoneStates( state ),
	} ),
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId( {
			filterByWholeCountry,
			filterByState,
			filterByPostcode,
			toggleStateSelected,
			editPostcode,
		}, dispatch, ownProps.siteId )
	} )
)( localize( ShippingZoneLocationDialogSettings ) );
