import React from 'react';
import StaticComponent from './StaticComponent';

/**
 * The version
 * NOTE: Remember to update package.json too!
 *
 * @example
 * <Version />
 */
function Version () {
   return <span className="Version">v0.35.1</span>
}

export default StaticComponent(Version)
