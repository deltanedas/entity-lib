const entityLib = this.global.entityLib;

function extendMech(Base, name, def){
	// Merge def over the original custom Mech definition.
	const mechDef = Object.create(entityLib.Mech);
	Object.assign(mechDef, def);
	return extendContent(Base, name, mechDef);
}

function extendUnit(Base, name, def){
	// Merge def over the original custom Mech definition.
	const unitDef = Object.create(entityLib.Unit);
	Object.assign(unitDef, def);
	return extendContent(Base, name, unitDef);
}

this.global.entityLib.extendMech = extendMech;
this.global.entityLib.extendUnit = extendUnit;