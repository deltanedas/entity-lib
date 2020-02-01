const entityLib = this.global.entityLib;

function extendMech(Base, name, features){
	// Merge def over the original custom Mech definition.
	const mechDef = Object.create(entityLib.Mech);
	features.forEach(def => {
		mechDef = Object.assign(def, mechDef);
	});

	return extendContent(Base, name, mechDef);
}

function extendUnit(Base, name, features){
	// Merge def over the original custom Unit definition.
	const unitDef = Object.create(entityLib.Unit);
	features.forEach(def => {
		unitDef = Object.assign(def, unitDef);
	});

	return extendContent(Base, name, unitDef);
}

function extendWeapon(Base, parent, features){
	const weaponDef = Object.create(entityLib.MultiWeapon);
	features.forEach(def => {
		weaponDef = Object.assign(def, weaponDef);
	});

	const ret = extendContent(Weapon, parent.name + "-multiweapon", weaponDef);
	ret.parent = parent;
	ret.isMech = parent.turnCursor !== undefined; // Will not work if UnitType gains a turnCursor field
	return ret;
}

this.global.entityLib.extendMech = extendMech;
this.global.entityLib.extendUnit = extendUnit;
this.global.entityLib.extendWeapon = extendWeapon;