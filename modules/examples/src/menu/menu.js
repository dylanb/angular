import *  as app from './menu_common';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  app.main();
}
