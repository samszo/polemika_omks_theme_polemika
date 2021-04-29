class Qualification extends Proto {

    constructor() {
		super();
		var self = this;
		this.modal = null;
		this.geo = new Geo();
		this.geo.getPosition(function(coords) {}); // just for ask the user for its approval when starting the app
        this.resultData = {
            resource : { 
                type : null, // 'picture' ou 'text'
                value : null // value of text if type == 'image'
            },
            property : [],
            user : null,
            geoLoc : null,
            date : null,
            info : null
        }
		var params = self.getGetParameters();
		var info = self.getOneInformation(params.info);
		this.resultData.info = info;
		var $info = $(".information");
		var $infoImg = $(".infoImg", $info);
		var $infoText = $(".infoText", $info);
		$infoImg.attr("src", info.media.imgUrl);
		$infoText.text(info.texte);				
		// bind events on informations
		console.log("bind events ...");
		$infoImg.unbind("click").bind("click", function() {
			self.selectInfo($infoImg);
		});
		$infoText.unbind("mouseup").bind("mouseup", function() {
			var selection = null;		        
			var selection = window.getSelection()
			var node = selection.focusNode.parentNode;
			if (node == $infoText[0]) {
				var text = selection.toString();
				if (text == '') {// whole text
					text = $infoText.text();
				}
				self.selectInfo($infoText, text);
			}
		});
		/*$(".boutonQualifier").unbind("click").bind("click", function() {
			self.openMenu();
		});*/
    }
	openMenu() {
		var self = this;
		var $dataviz = $("body #dataviz");
		if ($dataviz.length > 0)
			$dataviz.remove();
		$dataviz = $("<div id='dataviz'></div>");
		$("body").append($dataviz);
		self.getCircularMenuData(function(menuData) {
			$dataviz.empty();
			new MenuQualification({
				'idCont':"dataviz",
				'width':200,
				'data' : menuData,
				'callback' : function(selectedItems) {
					console.log("selectedItems");
					//$(".result").text(JSON.stringify(omkData, undefined, 4));
					var selected = [];
					$.each(selectedItems, function(index, itemData) {
						selected.push(itemData.data.omkId);
					});
					self.resultData.selected = selected;
					//$(".boutonQualifier").removeClass("hidden");
					self.serializeResult(function(omkData) {
						console.log("Send qualification to server ...");						
						console.log(JSON.stringify(omkData, undefined, 4));
						self.sendResult(omkData);
					});
					self.deselectInfo();
					self.closeMenu();
				}
			});
			self.modal = new McModal($dataviz, [
				{action : "cancel", callback : function(modalLock) {
					modalLock.resolve();
					$("body #content").removeClass("blur");
					self.deselectInfo();
				}}
			]);
			$("body #content").addClass("blur");
			self.modal.show();
		});
	}
	closeMenu() {
		this.modal.node.find("span.close").click();
	}
    serializeResult(callback) {
        var self = this;
        self.geo.getPosition(function(coords) {
            self.resultData.geoLoc = coords;
            var latitude = null;
			var longitude = null;
			if (coords) {
				latitude = coords.latitude;
				longitude = coords.longitude;
			}
			var today = new Date();
            self.resultData.date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
            if (self.resultData.resource.type == 'picture')
                self.resultData.resource.omkId = self.resultData.info.media.omkId;
            else
                self.resultData.resource.omkId = self.resultData.info.omkId;
            // serialize as omk RDF
            var omkData = {
                'dcterms:title' : "TODO",
                'jdc:creationDate' : self.resultData.date,
                'ma:locationLatitude' : latitude,
                'ma:locationLongitude' : longitude,
                'oa:hasSource' : [{
                    'type':'resource',
                    'value':self.resultData.resource
                }],
                'TD:property' : self.resultData.property,
                'TD:user' : "TODO",
                'TD:info' : self.resultData.info,
				'TODO:selected' : self.resultData.selected
            }            
            callback(omkData);
        });    
    }
    sendResult(omkData) {
		//message pour patienter
		d3.select('#modWaitLbl').text("Merci de patienter...");                
		d3.select('#waitError').style('display','none');
		d3.select('#waitFermer').style('display','none');
		d3.select('#waitloader').style('display','block');    
		$('#modWait').modal('show');


		let start = new Date()
		, flux = 'menu-qualification'
		, strDate = start.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })    
		, omk = {
			'dcterms:title':flux+' _ '+omkData['TD:info']['texte']+' : '+actant.nom+' '+strDate
			,'dcterms:isReferencedBy':omkData["TD:info"].media.omkId.id+'_'+omkData["TD:info"].omkId.id+'_'+this.classId+' : '+start.valueOf()+' : '+actant.id
			,'jdc:creationDate':start
			,'ma:hasCreator':[{'type':'items','value':actant.id}]
			,'jdc:hasActant':[{'type':'items','value':actant.id}]
			,'ma:hasRating':[]
			,'ma:isRatingOf':[]
			,'ma:ratingScaleMax':1
			,'ma:ratingScaleMin':0
			,'ma:hasRatingSystem':[{'type':'item_sets','value':this.colId}]
			,'ma:locationLatitude':omkData["ma:locationLatitude"] ? omkData["ma:locationLatitude"] : 0
			,'ma:locationLongitude':omkData["ma:locationLongitude"] ? omkData["ma:locationLongitude"] : 0
			,'jdc:hasDoc':[{'type':'media','value':omkData["TD:info"].media.omkId.id},{'type':'items','value':omkData["TD:info"].omkId.id}]
			,'jdc:distanceCenter':1
			,'jdc:hasConcept':[]
			,'jdc:distanceConcept':[]
			,'jdc:x':0
			,'jdc:y':0
			,'jdc:xRatingValue':0
			,'jdc:yRatingValue':0
		};
	
		omkData["TODO:selected"].forEach(function(c, i){
			omk['ma:hasRating'].push(1);
			omk['ma:isRatingOf'].push({'type':c.type,'value':c.id});
			omk['jdc:hasConcept'].push({'type':c.type,'value':c.id});
			omk['jdc:distanceConcept'].push(1);
	
		})

		$.ajax({
			type: 'POST',
			dataType: 'json',
			url: this.urlAjoutRapports,
			data: {
					'json':true,
					'rt': 'menu-qualification',
					'rapports': omk
			}
			}).done(function(data) {
				d3.select('#waitloader').style('display','none');    
				d3.select('#waitFermer').style('display','block');
				d3.select('#modWaitLbl').text("Position enregistrée");                
				setTimeout(function(){
					$('#modWait').modal('hide');
				}, 3000);
			})
			.fail(function(e) {
					//throw new Error("Sauvegarde imposible : " + e);
					d3.select('#modWaitLbl').text("Sauvegarde imposible");                
					d3.select('#waitError').style('display','block').html(e.responseText);
					d3.select('#waitFermer').style('display','block');
					d3.select('#waitloader').style('display','none');    
					 
			});		
    }
	selectInfo($info, value) {				
		if ($info.hasClass("infoText")) {
			this.resultData.resource.type = 'text';
			this.resultData.resource.value = value;
		} else {
			this.resultData.resource.type = 'picture';
			this.resultData.resource.value = '';
		}		
		$(".infoElt").removeClass("selected");
		$info.addClass("selected");
		//$(".boutonQualifier").removeClass("hidden");
		this.openMenu();
	}
	deselectInfo() {				
		//$(".boutonQualifier").addClass("hidden");
		$(".infoElt").removeClass("selected");
	}
}