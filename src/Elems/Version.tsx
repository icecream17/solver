
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
function Version() {
   return <span className="Version">v0.27.0</span>
}

export default StaticComponent(Version)
