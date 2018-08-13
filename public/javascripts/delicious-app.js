import "../sass/style.scss";

import { $, $$ } from "./modules/bling";
import autoComplete from "./modules/autoComplete";
import searchResturant from "./modules/searchResturant";
autoComplete($("#address"), $("#lat"), $("#lng"));
searchResturant($(".search"));
