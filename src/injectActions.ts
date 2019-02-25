import invariant from 'invariant'
import React from 'react'
import PropTypes from 'prop-types';
import { App } from './createApp';

function getDisplayName(Component: React.ComponentType<any>) {
  const name = (Component && (Component.displayName || Component.name)) || 'Component';
  return `injectActions(${name})`;
};

/**
 * A property P will be present if:
 * - it is present in DecorationTargetProps
 *
 * Its value will be dependent on the following conditions
 * - if property P is present in InjectedProps and its definition extends the definition
 *   in DecorationTargetProps, then its definition will be that of DecorationTargetProps[P]
 * - if property P is not present in InjectedProps then its definition will be that of
 *   DecorationTargetProps[P]
 * - if property P is present in InjectedProps but does not extend the
 *   DecorationTargetProps[P] definition, its definition will be that of InjectedProps[P]
 */
type Merging<InjectedProps, DecorationTargetProps> = {
  [P in keyof DecorationTargetProps & InjectedProps]: P extends keyof InjectedProps
  ? InjectedProps[P] extends DecorationTargetProps[P]
    ? DecorationTargetProps[P]
    : InjectedProps[P]
  : DecorationTargetProps[P];
};

/**
 * a property P will be present if :
 * - it is present in both DecorationTargetProps and InjectedProps
 * - InjectedProps[P] can satisfy DecorationTargetProps[P]
 * ie: decorated component can accept more types than decorator is injecting
 *
 * For decoration, inject props or ownProps are all optionally
 * required by the decorated (right hand side) component.
 * But any property required by the decorated component must be satisfied by the injected property.
 */
type Shared<
  InjectedProps,
  DecorationTargetProps extends Shared<InjectedProps, DecorationTargetProps>
> = {
    [P in Extract<keyof InjectedProps, keyof DecorationTargetProps>]?: InjectedProps[P] extends DecorationTargetProps[P] ? DecorationTargetProps[P] : never;
};

// Omit taken from https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type GetProps<C> = C extends React.ComponentType<infer P> ? P : never;

type InjectOptions = {
  propName?: string;
  withRef?: boolean;
};

type TInjectedProps<TC> = {
  actions: App['actions'];
  ref?: React.RefObject<React.ReactElement<GetProps<TC>>>;
};

type PassProps<TC> = Omit<GetProps<TC>, keyof Shared<TInjectedProps<TC>, GetProps<TC>>>;

export default function injectActions<C extends React.ComponentType<Merging<TInjectedProps<C>, GetProps<C>>>>(
  WrappedComponent: C,
  options: InjectOptions,
): React.ComponentType<PassProps<C>> {
  const {
    propName = 'actions',
    withRef = false,
  } = options;



  type InnerProps = GetProps<C>;

  class InjectActions extends React.Component<InnerProps> {
    static displayName = getDisplayName(WrappedComponent);
    static contextTypes = {
      actions: PropTypes.object.isRequired,
    };
    wrappedInstanceRef: React.RefObject<React.ReactElement<GetProps<C>>>;

    constructor(props: InnerProps, context: any) { // TODO: use React.createContext()
      super(props, context);
      const { actions } = context;
      this.wrappedInstanceRef = React.createRef();
      if (process.env.NODE_ENV !== 'production') {
        invariant(
          actions,
          '[injectActions] Could not find required `actions` object. ' +
          '<ActionsProvider> needs to exist in the component ancestry.',
        )
      }
    }

    getWrappedInstance() {
      if (process.env.NODE_ENV !== 'production') {
        invariant(
          withRef,
          'To access the wrapped instance, you need to specify { withRef: true } in the options argument of the injectActions() call.',
        )
      }
      return this.wrappedInstanceRef.current;
    }

    render() {
      const props: InnerProps & TInjectedProps<C> = {
        ...this.props,
        [propName]: this.context.actions,
      } as InnerProps & TInjectedProps<C>;

      if (withRef) {
        props.ref = this.wrappedInstanceRef;
      }

      return React.createElement(WrappedComponent, props)
    }
  }

  return InjectActions as any; // TODO: any
};
