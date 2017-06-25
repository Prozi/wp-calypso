/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { find, isObject } from 'lodash';

/**
 * Internal dependencies
 */
// TODO: Remove this when product edits have siteIds.
import { getActionList } from 'woocommerce/state/action-list/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { editProductRemoveCategory } from 'woocommerce/state/ui/products/actions';
import { getAllProductEdits } from 'woocommerce/state/ui/products/selectors';
import { getAllProductCategoryEdits } from 'woocommerce/state/ui/product-categories/selectors';
import { createProduct } from 'woocommerce/state/sites/products/actions';
import { createProductCategory } from 'woocommerce/state/sites/product-categories/actions';
import {
	actionListStepNext,
	actionListStepSuccess,
	actionListStepFailure,
	actionListClear,
} from 'woocommerce/state/action-list/actions';
import {
	WOOCOMMERCE_PRODUCT_CREATE,
	WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
	WOOCOMMERCE_PRODUCT_CATEGORY_EDIT,
	WOOCOMMERCE_PRODUCT_ACTION_LIST_CREATE,
	WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_PRODUCT_CATEGORY_EDIT ]: [ handleProductCategoryEdit ],
	[ WOOCOMMERCE_PRODUCT_ACTION_LIST_CREATE ]: [ handleProductActionListCreate ],
	[ WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED ]: [ handleProductCategoryUpdated ],
};

export function handleProductCategoryEdit( { dispatch, getState }, action ) {
	const rootState = getState();
	const { siteId, category, data } = action;

	if ( null === data ) {
		// It's removing a category from edits.
		const categoryCreates = getAllProductCategoryEdits( rootState, siteId ).creates;
		if ( find( categoryCreates, { id: category.id } ) ) {
			// It's a create, it needs to be removed from any product edits as well.
			const productEdits = getAllProductEdits( rootState, siteId );

			productEdits.creates && productEdits.creates.forEach( ( product ) => {
				dispatch( editProductRemoveCategory( siteId, product, category.id ) );
			} );

			productEdits.updates && productEdits.updates.forEach( ( product ) => {
				dispatch( editProductRemoveCategory( siteId, product, category.id ) );
			} );
		}
	}
}

export function handleProductActionListCreate( store, action ) {
	const { successAction, failureAction } = action;

	const onSuccess = ( dispatch ) => dispatch( successAction );
	const onFailure = ( dispatch ) => {
		dispatch( failureAction );
		dispatch( actionListClear() );
	};
	const actionList = makeProductActionList( store.getState(), undefined, undefined, onSuccess, onFailure );

	store.dispatch( actionListStepNext( actionList ) );
}

export function handleProductCategoryUpdated( { dispatch, getState }, action ) {
	const { originatingAction } = action;
	const actionList = getActionList( getState() );

	if ( WOOCOMMERCE_PRODUCT_CATEGORY_CREATE === originatingAction.type ) {
		// A category was created, let's update any placeholders for it that we have.
		const placeholderId = originatingAction.id;
		const realId = action.data.id;
		const newActionList = updateActionListCategoryId( actionList, placeholderId, realId );
		dispatch( actionListStepNext( newActionList ) );
	}
}

const updateProperty = ( propertyName, updater ) => ( object ) => {
	return { ...object, [ propertyName ]: updater( object[ propertyName ] ) };
};

const replaceProperty = ( propertyName, oldValue, newValue ) => {
	return updateProperty( propertyName, ( value ) => {
		return ( value === oldValue ? newValue : value );
	} );
};

export function updateActionListCategoryId( actionList, placeholderId, realId ) {
	const updateCategory = replaceProperty( 'id', placeholderId, realId );

	const updateCategories = updateProperty( 'categories', ( categories ) => {
		return ( categories ? categories.map( updateCategory ) : undefined );
	} );

	const updateStep = updateProperty( 'action', ( action ) => {
		if ( WOOCOMMERCE_PRODUCT_CREATE === action.type ) {
			return updateProperty( 'product', updateCategories )( action );
		}
		return action;
	} );

	return {
		...actionList,
		steps: actionList.steps.map( updateStep ),
	};
}

/**
 * Makes a product Action List object based on current product edits.
 *
 * For internal and testing use only.
 * @private
 * @param {Object} rootState The root calypso state.
 * @param {Number} [siteId=selected site] The siteId for the Action List (TODO: Remove this when edits have siteIds.)
 * @param {Object} [productEdits=all edits] The product edits to be included in the Action List
 * @param {Object} [successAction] Action to be dispatched upon successful action list completion.
 * @param {Object} [failureAction] Action to be dispatched upon failure of action list execution.
 * @return {Object} An Action List object.
 */
export function makeProductActionList(
	rootState,
	siteId = getSelectedSiteId( rootState ),
	productEdits = getAllProductEdits( rootState, siteId ),
	onSuccess,
	onFailure,
) {
	return {
		nextSteps: [
			...makeProductCategorySteps( rootState, siteId, productEdits ),
			...makeProductSteps( rootState, siteId, productEdits ),
			// TODO: ...makeProductVariationSteps( rootState, siteId, productEdits ),
		],
		onSuccess,
		onFailure,
	};
}

export function makeProductCategorySteps( rootState, siteId, productEdits ) {
	const creates = productEdits.creates || [];
	const updates = productEdits.updates || [];
	const categoryEdits = getAllProductCategoryEdits( rootState, siteId );

	// Collect all the IDs of all new categories that are referenced by a product edit.
	const newCategoryIds = getNewCategoryIdsForEdits( [ ...creates, ...updates ] );

	// Construct a step for each new category to be created.
	const createSteps = newCategoryIds.map( ( categoryId ) => {
		const category = find( categoryEdits.creates, { id: categoryId } );

		return {
			description: translate( 'Creating product category: ' ) + category.name,
			onStep: ( dispatch, actionList ) => {
				dispatch( createProductCategory(
					siteId,
					category,
					actionListStepSuccess( actionList ),
					actionListStepFailure( actionList ), // Error will be set by request code
				) );
			},
		};
	} );

	return [
		...createSteps,
		// TODO: ...updateSteps,
		// TODO: ...deleteSteps,
	];
}

function getNewCategoryIdsForEdits( edits ) {
	return edits.reduce( ( categoryIds, product ) => {
		return getCategoryIdsForProduct( product ).filter( ( id ) => {
			return isObject( id ) && categoryIds.indexOf( id ) === -1;
		} );
	}, [] );
}

function getCategoryIdsForProduct( product ) {
	const categories = product.categories || [];

	return categories.map( ( category ) => {
		return category.id;
	} );
}

export function makeProductSteps( rootState, siteId, productEdits ) {
	let createSteps = [];

	if ( productEdits.creates ) {
		// TODO: Consider making these parallel actions.
		createSteps = productEdits.creates.map( ( product ) => {
			return {
				description: translate( 'Creating product: ' ) + product.name,
				onStep: ( dispatch, actionList ) => {
					dispatch( createProduct(
						siteId,
						product,
						actionListStepSuccess( actionList ),
						actionListStepFailure( actionList ), // Error will be set by request code
					) );
				},
			};
		} );
	}

	return [
		...createSteps,
		// TODO: ...updateSteps,
		// TODO: ...deleteSteps,
	];
}

/*
export function makeProductVariationSteps( allSteps, rootState, siteId, productEdits ) {
	return [
	  // TODO: ...createSteps,
	  // TODO: ...updateSteps,
	  // TODO: ...deleteSteps,
	];
}
*/

