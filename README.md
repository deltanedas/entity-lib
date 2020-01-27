# Entity Lib

Adds a global field `entityLib`.

You can extend classes `entityLib.Mech` or `entityLib.Unit`.

By default, it functions like a vanilla one.

Set `features` to a map of features and values.

Current features:
```
"weapons": Array of Weapon
"limit-rotation": Limit rotation to a certain angle every tick.

# How to use

Add `entity-lib` to your `depedencies: []` in **mod.hjson**.

You may extend drawWeapon(int number, Player player) to draw weapons how you want.

See example code below:
```js
const myMech = extendContent(entityLib.Mech, "my-mech", {});
myMech.rotationLimit = 1; // 60' per second usually
myMech.weapons = [
	Mechs.omega.weapon,
	Mechs.dart.weapon,
	Mechs.duo.weapon
];
```
