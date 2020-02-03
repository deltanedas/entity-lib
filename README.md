# Entity Lib

Adds a field `this.global.entityLib`.

You can extend custom mechs/units with certain attributes such as:
* Limiting rotation speed
* Multiple unique weapons
* more

By default, they function like vanilla ones.

# How to use

Add `entity-lib` to your `dependencies: []` in **mod.hjson**.

You may extend: (where Entity is Player or Unit)

* drawWeapon(Entity entity, float rotation, int number, uint index): draw weapons how you wish. May be optional.
* drawUnder(Entity entity, float rotation): draw sprites underneath the weapons. Optional.
* drawAbove(Entity entity, float rotation): draw sprites above the weapons. Optional.
* some others, I really need to update docs (read code intead)

__**Do not set this.region as its entity will draw it with raw rotation.**__

For each weapon, you can set `recoilRecovery` which determines how fast recoil is recovered, by default it is `1 / (reload + 1)`.


# Functions and fields

`trueRotation(Entity entity)`: get rotation after all limits are processed.

`trueRotation(Entity entity, float rotation)`: set the true rotation.

`rotationLimit` is maximum rotation per tick.

`weapons` are an array of `Weapon`s to be fired.

See example code below:
```js
const entityLib = this.global.entityLib; // Like Java import
const myMech = entityLib.extendMech(Mech, "my-mech", [{
	loadAfter(){
		this.underRegion = Core.atlas.find("error");
	},
	drawUnder(player, rot){
		Draw.rect(this.underRegion, player.x, player.y, rot);
	}
}]);
myMech.rotationLimit = 1; // 60' per second usually
myMech.rotationLerp = 0.02;
myMech.weapons = [
	Mechs.omega.weapon,
	Mechs.dart.weapon,
	Mechs.delta.weapon
];
```

You can also look at some full examples:
* https://github.com/DeltaNedas/entity-lib-example/blob/master/scripts/routertron.js
* https://github.com/DeltaNedas/vbucks/blob/master/scripts/mechs/hurricane.js
* https://github.com/DeltaNedas/vbucks/blob/master/scripts/mechs/mother-hen.js