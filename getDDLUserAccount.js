{
function random_password_generate(length) {
    var max = length;
	var min = length;
	var passwordChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#";
    var randPwLen = Math.floor(Math.random() * (max - min + 1)) + min;
    var randPassword = Array(randPwLen).fill(passwordChars).map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    return randPassword;
}
function generateURI(database,userid,passwd) {

list_replicas = rs.status().members;
replicaSetName = rs.status().set;
servers_list = "";
for (var i=0; i < list_replicas.length; i++) {
	if (list_replicas[i].stateStr == "PRIMARY" || list_replicas[i].stateStr == "SECONDARY") {
	  servers_list += list_replicas[i].name;
	  if (i < list_replicas.length-1) {
	     servers_list += ",";
	  }
	}
}
return "mongodb://" + userid + ":" + passwd + "@" + servers_list + "/" + database + "?replicaSet=" + replicaSetName;
}
print(" ");
print("###############################################################");
print("# Get User Account DDL for All Databases");
print("###############################################################");
print(" ");
var listDBs = db.adminCommand( { listDatabases: 1 } );
var listPasswd = [];
for (var i = 0; i < listDBs.databases.length; i++) {
   if (listDBs.databases[i].name != "config" && listDBs.databases[i].name != "local"){
     currentDB = db.getSiblingDB(listDBs.databases[i].name);
	 print(" ");
	 print("----------------------------------")
	 print("DB: " + listDBs.databases[i].name);
	 print("----------------------------------");
	 print(" ");
	 print("use " + listDBs.databases[i].name + ";");
	 listUsers = currentDB.getUsers();
	 var a = String.fromCharCode(34);
     var c1 = String.fromCharCode(123);
	 var c2 = String.fromCharCode(125);
	 for (var j = 0; j < listUsers.length; j++) {
	    if (listUsers[j].user != "mms-automation" && listUsers[j].user != "mms-backup-agent" && listUsers[j].user != "mms-monitoring-agent") {
		  listPasswd.push(random_password_generate(16));
		  cmd = "db.createUser(" + c1 + " user:" + a + listUsers[j].user + a + ",pwd: " + a + listPasswd[j] + a + ", roles:[";
		  roleCmd = "";
		  for (var z = 0; z < listUsers[j].roles.length; z++) {
		     if (z > 0 && z <= listUsers[j].roles.length-1) {
		       roleCmd = roleCmd + ", ";
		     }
		  roleCmd = roleCmd + c1 + " role: " + a + listUsers[j].roles[z].role + a + ", db: " + a + listUsers[j].roles[z].db + a + " " + c2;
		  }
		  cmd = cmd + roleCmd + "]" + c2 + ");";
		  print(cmd);
		}
	 }	 
	 print(" ");
	 print("-- Connection String:");
	 for (var j = 0; j < listUsers.length; j++) {
	    if (listUsers[j].user != "mms-automation" && listUsers[j].user != "mms-backup-agent" && listUsers[j].user != "mms-monitoring-agent") {
		  print(generateURI(listDBs.databases[i].name,listUsers[j].user,listPasswd[j]));
		}
	 }
   }
}
print(" ");
}