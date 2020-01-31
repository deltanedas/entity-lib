print("init")
this.global.entityLib = {};

g = new Packages.org.mozilla.javascript.tools.shell.Global(Packages.org.mozilla.javascript.Context.getCurrentContext());
const require = g.load;

print("require: " + require)
print(require("common.js"))
print(require("common.js")())
require("common.js")();
require("mech.js")();
require("unit.js")();
