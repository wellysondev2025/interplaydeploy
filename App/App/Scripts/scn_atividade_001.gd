extends Control

@onready var paint_control = get_node("PaintControl")
@onready var Title = (get_node("Title") as Sprite2D)
@onready var Content = (get_node("Content") as Sprite2D)
@onready var BackGroundContent = (get_node("BGContent") as Sprite2D)
@onready var ForegroundContent = (get_node("Foreground") as Sprite2D)
@onready var lblDebugText : Label = get_node("lblDebug")
@onready var WaitDisplay : Node2D = get_node("WaitElements")
	
@export var deslocamentoToolBox = 206
@export var speed = 400
@export var Titles : Array[Texture2D]
@export var Contents : Array[Texture2D]
@export var SubActivitiesContents : Array[Texture2D]
@export var ForegroundOutlines : Array[Texture2D]
@export var Atv13RandomNumbers : Array[Texture2D]

var ToolBoxStatus = 'Hidden'
var ActualColor = 'ffffff'
var ActualTool = 'Brush'
var HandSubType = 'None'
var XmarkMaximum = 20
var Xmarks = 0
var MapementoCores : Array[String]
var BrushColors: Array[String]
var originalImage : Image = null
var ClickNumber : int =0
var MaxClickNumber : int = 0
var ActivityInitalTime : float

# Called when the node enters the scene tree for the first time.
func _ready():
	ActivityInitalTime = Time.get_unix_time_from_system()
	
	#Aqui vamos preparar a cena...
	UpdateActivity()
	BrushColors.append('c673f6')
	BrushColors.append('f761ff')
	BrushColors.append('ff5d5d')
	BrushColors.append('fce95b')
	BrushColors.append('d1f970')
	BrushColors.append('42ee81')
	BrushColors.append('23cded')
	BrushColors.append('f3a8a2')
	BrushColors.append('868686')
	ChangeColorFromTool(BrushColors[randi_range(0, BrushColors.size()-1)])
	lblDebugText.text = str(InterplayController.InicialActivity)
	
	pass # Replace with function body.

# Função que carrega a imagem de outline por cima da imagem do content, 
# utilizada nos momentos em que precisamos da ferramenta "balde de tinta"
func PrepareForeground(indice: int):
	ForegroundContent.visible = true
	ForegroundContent.texture = ForegroundOutlines[indice]
	ForegroundContent.scale.x = 0
	ForegroundContent.scale.x = 1
	return 0

func PrepareBucketImage():
	var fatorBuscaMax = 0.91
	var fatorBuscaMin = 0.89
	var blankColor = Color.WHITE
	MapementoCores.clear()
	originalImage = Content.texture.get_image()
	var showImage = Content.texture.get_image()
	#dynImage.lock()
	for x in range(originalImage.get_size().x):
		for y in range(originalImage.get_size().y):
			var checkPixel = originalImage.get_pixel(x,y)
			if (checkPixel.a <= fatorBuscaMax && checkPixel.a >= fatorBuscaMin):
				var color = checkPixel
				if (MapementoCores.has(color.to_html()) == false):
					MapementoCores.push_front(color.to_html())
				showImage.set_pixel(x,y, blankColor)
					
	var imageTexture = ImageTexture.new()
	imageTexture.create_from_image(Content.texture.get_image())
	imageTexture.set_image(showImage)
	Content.texture = imageTexture
	
	return

func UpdateActivity():
	'''
	var activity = str(InterplayController.InicialActivity).pad_zeros(3)
	var pasta = "res://Assets/CDL/Atv"+ activity +"/"
	if DirAccess.dir_exists_absolute(pasta):	
		var titlePath = pasta + "Title.png"
		if (FileAccess.file_exists(titlePath)) :		
			var Title = (get_node("Title") as Sprite2D)
			var newTitleTexture = load(titlePath)
			if (newTitleTexture != null):
				Title.texture = newTitleTexture 
		var contentPath = pasta + "Content.png"
		if (FileAccess.file_exists(contentPath)) :		
			var Content = (get_node("Content") as Sprite2D)
			var newContentTexture = load(contentPath)
			if (newContentTexture != null):
				Content.texture = newContentTexture 
	'''	
	
	if (Titles.size() > InterplayController.InicialActivity):
		Title.texture = Titles[InterplayController.InicialActivity-1]	
	
	if (Contents.size() > InterplayController.InicialActivity):
		Content.visible = true
		Content.texture = Contents[InterplayController.InicialActivity-1]
		Content.scale.x = 0
		Content.scale.x = 1
		
	#set defaults
	ActualTool = 'Brush'
	Xmarks = 0
	paint_control.brush_size = 16 #default
	ForegroundContent.visible = false
	InterplayController.MaxSubActivities = 0
	ClickNumber = 0
	MaxClickNumber = 0
	(get_node("Atv022Objects") as Node2D).visible = false
	
	#somente para testes...
	if (InterplayController.InicialActivity == 1):
		pass
	
	#Crianças
	if (InterplayController.InicialActivity == 4):
		ActualTool = 'Bucket'
		PrepareForeground(0) #o 0 é o índice da imagem onde está o FGC[x]
		PrepareBucketImage()
		
	#Canudinhos	
	if (InterplayController.InicialActivity == 5):
		#Content.scale *=1.3
		#paint_control.brush_size =  10
		ActualTool = 'Bucket'
		PrepareForeground(1) #o 0 é o índice da imagem onde está o FGC[x]
		PrepareBucketImage()
		
	#Crianças pulando na cama...
	if (InterplayController.InicialActivity == 6):		
		#Content.scale *=1.5
		ActualTool = 'Bucket'
		PrepareForeground(8) #o 0 é o índice da imagem onde está o FGC[x]
		PrepareBucketImage()
		
	#Cachorrinhos...
	if (InterplayController.InicialActivity == 7):		
		Content.scale *=1.5	
	
	#Cachorrinhos...
	if (InterplayController.InicialActivity == 8):		
		Content.scale *=1.5	
				
	#Cestas de Frutas...
	if (InterplayController.InicialActivity == 9):		
		Content.scale *=1.5
	
	#Cabelo mais longo
	if (InterplayController.InicialActivity == 10):		
		Content.scale *=1.45
				
	#Labirinto
	if (InterplayController.InicialActivity == 11):
		Content.scale *=1.3			
		Content.position.y = Content.position.y + 30
		paint_control.brush_size =  10

	#Encontre o diferente, gatinho, tesoura, patinho e carro
	if (InterplayController.InicialActivity == 12):
		ActualTool = 'Bucket'
		PrepareForeground(2) #o 0 é o índice da imagem onde está o FGC[x]
		PrepareBucketImage()
		
	#Bananas!!!
	if (InterplayController.InicialActivity == 13):
		ActualTool = 'Bucket'
		(get_node("Atv013Objects") as Node2D).visible = true
		PrepareForeground(7) #o 0 é o índice da imagem onde está o FGC[x]
		PrepareBucketImage()
		
		#Executa a lógica de sorteio dos números...
		randomize()		
		var val1 = randi_range(0,5)
		var usedElements = Array()
		for element in 6:
			val1 = randi_range(0,5)		
			var Elementname = "Atv013Objects/atv13_Element0"+str(element+1)
			var button = (get_node(Elementname) as TextureButton)
			while (usedElements.find(val1)>=0):
				val1 = randi_range(0,5)	
			usedElements.append(val1)
			button.texture_normal = (Atv13RandomNumbers[val1] as Texture2D)
		
	#Balões
	if (InterplayController.InicialActivity == 14):
		BackGroundContent.texture = Contents[InterplayController.InicialActivity-1]
		BackGroundContent.scale.x = 0
		BackGroundContent.scale.x = 1
		Content.visible = false
	
	#Completar Sequencias - Arrastar e Duplicar
	if (InterplayController.InicialActivity == 15):		
		ActualTool = 'Hand'
		HandSubType = 'DragSimple'
		(get_node("Atv015Objects") as Node2D).visible = true
		(get_node("tbxColorsTool") as TextureButton).visible = false	

	#Brincos e Relógio  - Arrastar e Posicionar
	if (InterplayController.InicialActivity == 16):		
		ActualTool = 'Hand'
		HandSubType = 'DragSimple'
		(get_node("Atv016Objects") as Node2D).visible = true
		(get_node("tbxColorsTool") as TextureButton).visible = false	
		
	#Formas geométricas, pintar a cor de acordo com a forma
	if (InterplayController.InicialActivity == 17):
		ActualTool = 'Bucket'
		PrepareForeground(3) #o 0 é o índice da imagem onde está o FGC[x]
		PrepareBucketImage()
	
	#Crianças com cachorro.
	if (InterplayController.InicialActivity == 18):		
		Content.scale *=1.5	
		
	#Aquário - clica com o X em cima...
	if (InterplayController.InicialActivity == 19):		
		Content.scale *=1.3
		ActualTool = 'Hand'
		HandSubType = 'XMark'
		XmarkMaximum = 6  	#6 peixes
		(get_node("tbxColorsTool") as TextureButton).visible = false
	
	#Sombras.
	if (InterplayController.InicialActivity == 20):			
		(get_node("CanvasArea") as Sprite2D).modulate = "#ffffe2"
		(get_node("BGContent") as Sprite2D).visible = false
		Content.scale *=1.5
		
	#Abelhas #### Atenção aqui tem SubActivities....
	if (InterplayController.InicialActivity == 21):	
		InterplayController.MaxSubActivities = 2
		Content.texture = SubActivitiesContents[InterplayController.SubActivity]
		Content.scale.x = 0
		Content.scale.x = 1
		Content.scale *=1.3

	##Ordenação da sequencia da borboleta
	if (InterplayController.InicialActivity == 22):		
		ActualTool = 'Hand'
		HandSubType = 'Enumerate'
		ClickNumber = 1
		MaxClickNumber = 4
		(get_node("Atv022Objects") as Node2D).visible = true
		(get_node("tbxColorsTool") as TextureButton).visible = false
	#Pintar os números
	#ATENÇÃO ESSEs NÚMEROs VAo MUDAR.... POIS AS ABELHAS (#21) VÃO VIRAR 3 SLIDES...
	if (InterplayController.InicialActivity == 23):
		ActualTool = 'Bucket'	
		PrepareForeground(4) #o 0 é o índice da imagem onde está o FGC[x]
		PrepareBucketImage()
	
	#ATENÇÃO ESSEs NÚMEROs VAo MUDAR.... POIS AS ABELHAS (#21) VÃO VIRAR 3 SLIDES...
	if InterplayController.InicialActivity == 24: # SIMBOLOS E FORMAS
		ActualTool = 'Bucket'	
		PrepareForeground(5) #o 0 é o índice da imagem onde está o FGC[x]
		PrepareBucketImage()
		
	if InterplayController.InicialActivity == 25: # SIMBOLOS E FORMAS
		ActualTool = 'Bucket'	
		PrepareForeground(6) #o 0 é o índice da imagem onde está o FGC[x]
		PrepareBucketImage()
	
	#Jogo dos 7 Erros
	if (InterplayController.InicialActivity == 28):		
		Content.scale *=1.5
		ActualTool = 'Hand'
		HandSubType = 'XMark'
		XmarkMaximum = 7	# 7 erros
		(get_node("tbxColorsTool") as TextureButton).visible = false
	
	#Separar Brinquedos de Transportes
	if (InterplayController.InicialActivity == 29):		
		ActualTool = 'Hand'
		HandSubType = 'DragSimple'
		(get_node("Atv029Objects") as Node2D).visible = true
		(get_node("tbxColorsTool") as TextureButton).visible = false

			
	(get_node("tbxBucket") as TextureButton).visible = false
	(get_node("tbxBrush") as TextureButton).visible = false
	(get_node("tbxHand") as TextureButton).visible = false
	
	if (ActualTool == 'Bucket'):
		(get_node("tbxBucket") as TextureButton).visible = true
	else:
		if (ActualTool == 'Hand' || ActualTool == 'Hand_X'):
			(get_node("tbxHand") as TextureButton).visible = true
		else:
			(get_node("tbxBrush") as TextureButton).visible = true
	#fim da função de preparação da tela, remove o WaitElements
	WaitModal(false)

func WaitModal(enable:bool):
	WaitDisplay.visible = enable
	$tbxProximo.visible = !enable
	

var painting :bool  = false
func SplashColor(color : Color):
	if painting:
		return
	else:
		painting = true	
		var newColor = Color(ActualColor)

		var image : Image = Content.texture.get_image()
		#dynImage.lock()
		for x in range(originalImage.get_size().x):
			for y in range(originalImage.get_size().y):
				if (originalImage.get_pixel(x,y) == color):
					image.set_pixel(x,y, newColor)		
					
		var imageTexture = ImageTexture.new()
		imageTexture.create_from_image(Content.texture.get_image())
		imageTexture.set_image(image)
		Content.texture = imageTexture
				
	painting = false	
	return


var Clicou = false
func _physics_process(delta):
	
	var mouse_pos = get_viewport().get_mouse_position()		
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):		
		Clicou = true
		
		if MapementoCores.size() > 0:
			var color : Color = originalImage.get_pixel(mouse_pos.x - 130, mouse_pos.y-170)
			# lblDebugText.text = str("(x=",mouse_pos.x, ", y=",mouse_pos.y, ") - Content X= ", Content.position.x, " Color: ")
			# lblDebugText.text += str(color)			
			if (MapementoCores.has(color.to_html())):
				#lblDebugText.modulate = color
				SplashColor(color)
				
	if Clicou && !Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
		Clicou = false
		if (ActualTool == 'Hand' && HandSubType == 'XMark'):
			if (Xmarks < XmarkMaximum):
				Xmarks +=1
				var s = (get_node("XMark") as Node2D).duplicate()
				s.position = get_global_mouse_position()
				add_child(s)
	
	if (ToolBoxStatus == 'Opening'):
		InterplayController.CanDraw = false
		if ((get_node("ToolPanel") as Node2D).position.x <= deslocamentoToolBox):
			(get_node("ToolPanel") as Node2D).position.x +=  speed * delta
		else:
			(get_node("ToolPanel") as Node2D).position.x = deslocamentoToolBox
			ToolBoxStatus = 'Open'
			
			
	if (ToolBoxStatus == 'Closing'):
		if ((get_node("ToolPanel") as Node2D).position.x > -1 * deslocamentoToolBox):
			(get_node("ToolPanel") as Node2D).position.x -=  speed * delta
		else:
			(get_node("ToolPanel") as Node2D).position.x = -1 * deslocamentoToolBox
			InterplayController.CanDraw = true
			ToolBoxStatus = 'Hidden'

func _on_tbx_colors_tool_pressed():
	if (ToolBoxStatus == 'Hidden'):
			ToolBoxStatus = 'Opening'

func _on_tbx_bg_pressed():
	if (ToolBoxStatus == 'Open'):
			ToolBoxStatus = 'Closing'
	
func ChangeColorFromTool(actualColor):
	ActualColor = actualColor
	if (ActualTool == 'Bucket'):
		(get_node("tbxBucket/BucketPaintColor") as Sprite2D).visible = true
		(get_node("tbxBucket/BucketPaintColor") as Sprite2D).modulate = ActualColor
		ToolBoxStatus = 'Closing'
	else:
		if (ActualTool == 'Hand'):	
			ToolBoxStatus = 'Closing'
		else:
			(get_node("tbxBrush/BrushPaintColor") as Sprite2D).visible = true
			(get_node("tbxBrush/BrushPaintColor") as Sprite2D).modulate = ActualColor
			paint_control.brush_color = ActualColor
			ToolBoxStatus = 'Closing'

func _on_tbx_001_pressed():		
	ChangeColorFromTool('c673f6')	
	
func _on_tbx_002_pressed():
	ChangeColorFromTool('f761ff')

func _on_tbx_003_pressed():
	ChangeColorFromTool('ff5d5d')

func _on_tbx_004_pressed():
	ChangeColorFromTool('fce95b')

func _on_tbx_005_pressed():
	ChangeColorFromTool('d1f970')

func _on_tbx_006_pressed():
	ChangeColorFromTool('42ee81')

func _on_tbx_007_pressed():
	ChangeColorFromTool('23cded')

func _on_tbx_008_pressed():
	ChangeColorFromTool('f3a8a2')

func _on_tbx_009_pressed():
	ChangeColorFromTool('868686')

func _on_tbx_brush_pressed():
	ActualTool = 'Brush'
	(get_node("tbxBucket/BucketPaintColor") as Sprite2D).visible = false
	ChangeColorFromTool(ActualColor)

func _on_tbx_bucket_pressed():
		ActualTool = 'Bucket'
		(get_node("tbxBrush/BrushPaintColor") as Sprite2D).visible = false
		ChangeColorFromTool(ActualColor)

var is_drawing = false
var draw_color = Color(1, 0, 0)  # Cor vermelha para o desenho

func _on_tbx_back_pressed():
	InterplayController.ResetActivity()
	get_tree().change_scene_to_file("res://Scenes/002_EscolhaAtividade.tscn")

func _on_tbx_proximo_pressed():	
	#calcular o tempo final da atividade	
	WaitModal(true)
	EnviarAtividade()	

var tempoTotalAtividade:float
func EnviarAtividade():
	var ActivityEndTime = Time.get_unix_time_from_system()
	var tempoTotalAtividade = ActivityEndTime - ActivityInitalTime

	# Captura o viewport
	var viewport = get_viewport()
	var img = viewport.get_texture().get_image()

	# Corrige a orientação da imagem
	#img.flip_y()

	# Reduz a imagem para tamanho seguro (ajuste conforme necessário)
	var max_width = 800
	var max_height = 600
	var scale_factor = min(max_width / img.get_width(), max_height / img.get_height(), 1)
	var new_width = int(img.get_width() * scale_factor)
	var new_height = int(img.get_height() * scale_factor)
	img.resize(new_width, new_height)

	# Salva a imagem para buffer PNG
	var image_buffer = img.save_png_to_buffer()

	# Converte para base64 limpo
	var image_base64 = "data:image/png;base64," + Marshalls.raw_to_base64(image_buffer).strip_edges()

	print("Imagem capturada:", new_width, "x", new_height)
	print("Tamanho do Base64:", image_base64.length())
	print("Preview Base64 (50 primeiros chars):", image_base64.substr(0, 50))

	# Monta payload
	var payload = {
		"session_hash": InterplayController.ActualSessionHash,
		"cod_activity": InterplayController.getActivityName(),
		"image": image_base64,
		"duration": int(round(tempoTotalAtividade))
	}

	# Envia para a API
	var url = InterplayController.ApiRoot + "game/activity/create/"
	var headers = [
		"Content-Type: application/json",
		"X-API-KEY: sua_chave_super_secreta_local"
		]
	var body = JSON.stringify(payload)

	$HTTPRequest_CreateActivity.timeout = 15
	var error = $HTTPRequest_CreateActivity.request(url, headers, HTTPClient.METHOD_POST, body)
	if error != OK:
		print("Erro ao iniciar request:", error)

func DoEnumerate(tbxBox):
	if (ActualTool == 'Hand' && HandSubType == 'Enumerate'):		
		if (ClickNumber <= MaxClickNumber):			
			var nodeName = "Atv022Objects/BoxMarkerValue0" + str(ClickNumber)
			(get_node(nodeName) as Sprite2D).position = (tbxBox as TextureButton).position
			(tbxBox as TextureButton).visible = false
			ClickNumber += 1

func _on_tbx_box_01_pressed():
	DoEnumerate(get_node('Atv022Objects/tbxBox01'))
	pass # Replace with function body.


func _on_tbx_box_02_pressed():
	DoEnumerate(get_node('Atv022Objects/tbxBox02'))
	pass # Replace with function body.


func _on_tbx_box_03_pressed():
	DoEnumerate(get_node('Atv022Objects/tbxBox03'))
	pass # Replace with function body.


func _on_tbx_box_04_pressed():
	DoEnumerate(get_node('Atv022Objects/tbxBox04'))
	pass # Replace with function body.


func _on_http_request_create_activity_request_completed(result, response_code, headers, body):

	WaitModal(false)

	if result != HTTPRequest.RESULT_SUCCESS:
		print("Falha na requisição HTTP:", result)
		return

	if response_code < 200 or response_code >= 300:
		print("Erro HTTP:", response_code)
		print(body.get_string_from_utf8())
		return

	var json = JSON.parse_string(body.get_string_from_utf8())

	if json == null:
		print("JSON inválido")
		return

	if not json.has("success"):
		print("Campo 'success' não encontrado")
		print(json)
		return

	if not json.success:
		print("API retornou erro:", json.msg)
		return

	# Agora está alinhado com seu serializer
	if json.has("activity") and json.activity.has("hash"):
		InterplayController.ActualActivityHash = json.activity.hash

	# Só avança se realmente salvou
	if InterplayController.NextActivity():
		get_tree().reload_current_scene()
	else:
		get_tree().change_scene_to_file("res://Scenes/CaminhoDasLetras/scn_atividade_final.tscn")
