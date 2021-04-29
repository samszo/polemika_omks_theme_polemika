class Proto {

    constructor() {		
		this.useLocal = window.location.origin.indexOf("127.0.0.1") > -1;
		this.APIBaseUrl = "https://polemika.univ-paris8.fr/omk";
		this.urlAjoutRapports = '../../../s/prototypes/page/ajax?json=1&type=ajoutRapport'
		this.useCorsProxy = this.useLocal
		this.classId = 133;
		this.colId = 5763;
    }
    getGetParameters() {
        var search = location.search.substring(1);
        if (search)
            return JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');    
        else
            return {};
    }
    getSyncJson(url) {
		//if (this.useCorsProxy && !url.startsWith("http://127.0.0.1:5000"))
		//    url = "https://cors-anywhere.herokuapp.com/"+url;
		var result = null;
		$.ajax({
		    type: 'GET',
		    url: url,
		    dataType: 'json',
		    success: function(object) {
		    	result = object;
		    },
		    data: {},
		    async: false
		});
		return result;
    }
	getItemsData(item_set_id) {
		var url = this.resolveAPIUrl("../../../api/items?item_set_id="+item_set_id);
		return this.getSyncJson(url);
	}
    getOneInformation(infoId) {
		var information = this.getOneInformationData(infoId);
		return this.readInformation(information);
    }	
	getOneInformationData(infoId) {		
		var informations = this.getItemsData(2);
		//$.getJSON(url, function(informations) {
		var information = null;
		if (infoId == null) {
			var randomIndex = Math.floor(Math.random() * (informations.length-1));
			information = informations[randomIndex];
		} else {
			$.each(informations, function(index, value) {
				if (value["o:id"] == infoId) {
					information = value;
					return false;
				}
			});
		}
		return information;
	}
	resolveAPIUrl(relativeUrl) {
		if (this.useLocal && relativeUrl.indexOf("../") == 0) {
			var apiUrl = this.APIBaseUrl;
			var shifts = 0
			while (relativeUrl.indexOf("../") == 0) {
				relativeUrl = relativeUrl.substring(3);
				shifts++;
			}
			if (shifts) {
				var tab = apiUrl.split("/");
				tab.splice(tab.length - shifts, shifts);
				apiUrl = tab.join("/")+"/";
			}
			return apiUrl + relativeUrl;
		} else
			return relativeUrl;
	}
	getMediaData(mediaUrl) {
        var mediaUrl = this.resolveAPIUrl(mediaUrl);
		return this.getSyncJson(mediaUrl);
	}
	readInformation(information) {
		var self = this;
		var data = [];
		var currentSet = data;
		var read = function(node) {
			if (Array.isArray(node)) {
				$.each(node, function(index, value) {
					read(value);
				});
			} else {
				var type = node["@type"];
				if (type && type.includes("o:Item")) { // Item
					var information = {
						texte : node["o:title"],
						omkId : {
						    id : node["o:id"],
						    type : type
						},
						media: null,
					}
					var mediaUrl = node["o:media"][0]["@id"];
					var mediaData = self.getMediaData(mediaUrl);					
					var media = {
						imgUrl: mediaData["o:thumbnail_urls"].large,//mediaData["o:source"],
						omkId : {
						    id : mediaData["o:id"],
						    type : mediaData["@type"]
						}
					}
					information.media = media
					currentSet.push(information);
				}
			}
		}
		read(information);
		var info = data[0]    
        return info;		
	}
    getCircularMenuData(callback, idClass) {
		if(idClass)this.classId=idClass
        if (this.circularMenuData)
            callback(this.circularMenuData);
        else {
			$.getJSON(this.resolveAPIUrl("../../../api/items?resource_class_id="+this.classId), function(object) {
    			var data = {
    				name: 'menu',
    				color: 'magenta',
    				children: [
    				]
    			};
    			var currentSet = data.children;
    			var read = function(node) {
    				if (Array.isArray(node)) {
    					$.each(node, function(index, value) {
    						read(value);
    					});
    				} else {
    					var type = node["@type"];
    					if (type && type.includes("o:Item") && type.includes("plmk:Monde")) { // world
    						var world = {
    							name : node["dcterms:title"][0]["@value"],
    							color: 'red',
        						omkId : {
        						    id : node["o:id"],
        						    type : 'items'//type
        						},
    							children: [
    							]
    						}
    						currentSet.push(world);
    						var oldSet = currentSet;
    						currentSet = world.children;
    						$.each(node, function(key, value) {
    							if (key.startsWith("plmk:")) {
    								if (value.length > 0) {
    									var property = {
    										name : value[0]["property_label"],
    										color: 'orange',
                    						omkId : {
                    						    id : value[0]["property_id"],
                    						    type : 'properties'//value[0]["type"]
                    						},
    										children: [
    										]
    									}
    									currentSet.push(property);
    									var oldSet = currentSet;
    									currentSet = property.children;
    									read(value);									
    									currentSet = oldSet;
    								}
    							}
    						});
    						currentSet = oldSet;
    					} else {
    						var type = node["type"];
    						
    						if (type && type == "resource") {
    							var propertyValue = {
    								name : node["display_title"],
    								color: 'blue',
    								size:1,
            						omkId : {
            						    id : node["value_resource_id"],
            						    type : node["value_resource_name"]
            						}    								
    							}
    							currentSet.push(propertyValue);
    						}
    					}
    				}
    			}
    			read(object);
    			this.circularMenuData = data;
    			callback(data);
    		});
        }
    }
}