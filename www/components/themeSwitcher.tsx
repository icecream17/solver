import { Fragment, jsx } from "snabbdom";
import IconButton from "./iconButton";

/** Change between light, dark, or other themes */

export default class ThemeSwitcher {
   render() {
      return <>
         <IconButton
            icon="paint-brush"
            label="Change theme"
            aria-haspopup="true"
            aria-expanded="false"
            onClick={() => {
               const themeList = document.getElementById("theme-list");
               if (themeList) {
                  themeList.classList.toggle("show");
               }
            }}
         ></IconButton>
         <ul
            id="theme-list"
            class={{"theme-popup": true}}
            aria-label="Themes"
            role="menu"
         >
            <li role="none">
               <button role="menuitem" class={{theme: true, 'theme-selected': true}} id="light-theme">Light</button>
            </li>
         </ul>
      </>;
   }
}
