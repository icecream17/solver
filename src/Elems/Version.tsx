
import React from 'react';
import StaticComponent from './StaticComponent';

/**
 * The version
 * NOTE: Update the version when possible
 * NOTE: Remember to update package.json too!
 *
 * @example
 * <Version />
 */
export default class Version extends StaticComponent {
   render() {
      return <span className="Version">v0.26.0</span>
   }
}
