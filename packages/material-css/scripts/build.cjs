const fs = require('fs')
const path = require('path')
const layoutGridFile = require.resolve('@material/layout-grid/dist/mdc.layout-grid.min.css')
const typographyFile = require.resolve('@material/typography/dist/mdc.typography.min.css')

const layoutGrid = fs.readFileSync(layoutGridFile, { encoding: 'utf-8' })
const typography = fs.readFileSync(typographyFile, { encoding: 'utf-8' })

fs.mkdirSync(path.join(__dirname, '../dist'), { recursive: true })
fs.writeFileSync(path.join(__dirname, '../dist/material-css.js'), `/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import {css} from 'lit-element';

export const layoutGrid = css\`${layoutGrid}\`;
export const typography = css\`${typography}\`;
`, { encoding: 'utf-8' })
