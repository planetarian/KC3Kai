# Daybreak
Daybreak is a new KC3 panel which uses React components to allow for extensive UI customization.

## Structure
Daybreak components are kept in their own js/css files and are loaded into the document via the Components class.

Ideally, the layout should be user-customizable, with save/load options and responsive aspects -- separate theme selections for different panel arrangements, etc.

## Components

### Base Components
These are components used by Daybreak to manage the layout system and wire components together.

#### DaybreakContainer
Container which can hold other components in a user-configurable fashion. If empty, the user can click a button to add a new component within the container, and it may also act as a drag target for rearranging components.

#### DaybreakElement
User-configurable element component. Provides the functionality for a component to be modified and moved around.

#### DaybreakLayoutRoot
Root component which contains all other user-configurable components. Child elements can be rearranged in Edit mode via a simple drag-and-drop interface.

#### DaybreakPanel
Main 'app' component for the KC3 panel.


### Editor Components
These are components used by the layout/property editor.

#### ComponentEditor
Component that provides a simple interface for adding components and modifying component properties.

#### PropertyField
Generates a named field for modifying a component property. Supports text, number, boolean, choice, and array values, and provides descriptions of values via tooltip.

#### PropertiesGroup
Holds a number of properties together as a group.


### Layout Components

#### GridPanel
Component which encapsulates a space implementing CSS grid-layout. Supports quickly rearranging and resizing elements among grid spaces in Edit mode.


### UI Components
These are controls and other UI framework components.

#### ConfirmButton
Displays a button which is replaced with a confirm/cancel prompt when clicked.

#### ModalDockPanel
Wraps some content in a dockable panel, with buttons to move the panel to different screen edges.

### Game Components

Coming soon