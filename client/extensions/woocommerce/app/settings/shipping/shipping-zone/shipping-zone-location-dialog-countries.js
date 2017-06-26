/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { filter, startsWith } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import LocationFlag from 'woocommerce/components/location-flag';
import { decodeEntities } from 'lib/formatting';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import {
	toggleContinentSelected,
	toggleCountrySelected,
} from 'woocommerce/state/ui/shipping/zones/locations/actions';
import {
	getCurrentlyEditingShippingZoneCountries,
	getCurrentlyEditingShippingZoneStates,
} from 'woocommerce/state/ui/shipping/zones/locations/selectors';

class ShippingZoneLocationDialogCountries extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			filter: '',
		};
	}

	render() {
		const { continentCountries, translate, actions } = this.props;

		const renderCountryLocation = ( location, index ) => {
			const { type, code, name, selected, disabled } = location;
			const isCountry = 'country' === type;

			const onToggle = ( event ) => {
				event.stopPropagation();
				(
					isCountry ? actions.toggleCountrySelected : actions.toggleContinentSelected
				)( code, ! selected );
			};

			const checkboxClass = classNames(
				'shipping-zone__location-dialog-list-item-checkbox',
				{ 'is-country': isCountry }
			);

			return (
				<li key={ index } className="shipping-zone__location-dialog-list-item" onClick={ onToggle }>
					<FormCheckbox
						onChange={ onToggle }
						className={ checkboxClass }
						checked={ selected }
						disabled={ ! selected && disabled } />
					{ isCountry ? <LocationFlag code={ code } /> : null }
					{ decodeEntities( name ) }
				</li>
			);
		};

		const onFilterChange = ( event ) => ( this.setState( { filter: event.target.value } ) );
		const locationsToRender = this.state.filter ? filter( continentCountries, ( location ) => (
			startsWith( location.name.toLowerCase(), this.state.filter.toLowerCase() )
		) ) : continentCountries;

		return (
			<FormFieldSet>
				<FormLabel>{ translate( 'Location' ) }</FormLabel>
				<FormTextInput
					value={ this.state.filter }
					onChange={ onFilterChange }
					placeholder={ translate( 'Filter by continent or country from the list below' ) } />
				<div className="shipping-zone__location-dialog-list-container">
					<ul className="shipping-zone__location-dialog-list">
						{ locationsToRender.map( renderCountryLocation ) }
					</ul>
				</div>
			</FormFieldSet>
		);
	}
}

ShippingZoneLocationDialogCountries.propTypes = {
	siteId: PropTypes.number,
};

export default connect(
	( state ) => ( {
		continentCountries: getCurrentlyEditingShippingZoneCountries( state ),
		states: getCurrentlyEditingShippingZoneStates( state ),
	} ),
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId( {
			toggleContinentSelected,
			toggleCountrySelected,
		}, dispatch, ownProps.siteId )
	} )
)( localize( ShippingZoneLocationDialogCountries ) );
