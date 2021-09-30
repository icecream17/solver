import React from "react";

export default class StaticComponent extends React.PureComponent {
   shouldComponentUpdate () { return false }
}
