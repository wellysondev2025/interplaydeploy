extends Node

var Version = "v 1.2"
var InicialActivity : int = 1
var SubActivity : int = 0
var MaxSubActivities : int = 0
var TotalActivities : int = 31
var BrushSize : int = 16
var CanDraw : bool = true
var ApiRoot : String = "https://interplay-backend.onrender.com/api/"
#var ApiRoot : String = "http://3.208.113.113:80/api/"


#Variáveis da parte de Persistência e integração com a API
var PatientID = ""
var PatientName = ""
var ActualSessionHash = ""
var ActualActivityHash = ""
var SessionInitialTime : float = 0.0

# Called when the node enters the scene tree for the first time.
func _ready():
	load_patient_data()
	pass # Replace with function body.

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass

func ResetActivity():	
	InicialActivity = 1
	
func NextActivity():		
	if (InicialActivity + 1 <= TotalActivities):
		if (InterplayController.SubActivity < InterplayController.MaxSubActivities):
			InterplayController.SubActivity+=1
		else:		
			InicialActivity+=1
			SubActivity = 0
			MaxSubActivities = 0
		return true
	#já reseta
	InicialActivity = 1
	return false

func load_patient_data():
	if not FileAccess.file_exists("user://interplaydata.json"):
		return # Error! We don't have a save to load.

	# Load the file line by line and process that dictionary to restore
	# the object it represents.
	var save_game = FileAccess.open("user://interplaydata.json", FileAccess.READ)
	while save_game.get_position() < save_game.get_length():
		var json_string = save_game.get_line()
		var json = JSON.new()
		var aux = json.parse_string(json_string)
		PatientID =  aux		

func save_patient_data():
	var save_game = FileAccess.open("user://interplaydata.json", FileAccess.WRITE)	
	var json_string = JSON.stringify(PatientID)
	save_game.store_line(json_string)
	
func getActivityName():
	if (MaxSubActivities > 0):
		return "CDL1_ATV_" + str(InicialActivity)+"_"+str(SubActivity+1)
	else:
		return "CDL1_ATV_" + str(InicialActivity)

func save_any_data(dataToSave):
	var save_game = FileAccess.open("user://backupdata.txt", FileAccess.WRITE)	
	var json_string = JSON.stringify(dataToSave)
	save_game.store_line(json_string)
