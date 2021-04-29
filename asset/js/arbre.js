class arbre {
    constructor(params) {
        var me = this;
        this.cont = d3.select("#"+params.idCont);
        this.width = params.width ? params.width : 400;
        this.height = params.height ? params.height : 400;
        this.dataUrl = params.dataUrl ? params.dataUrl : false;
        this.kId = params.kId ? params.kId : 'id'; //identifiant omeka S
        this.kName = params.kName ? params.kName : 'title'; //title omeka S
        this.data = params.data ? params.data : {
            "name": "Top Level",
            "children": [
              { 
                "name": "Level 2: A",
                "children": [
                  { "name": "Son of A" },
                  { "name": "Daughter of A" }
                ]
              },
              { "name": "Level 2: B" }
            ]
          };
        

        var svg, container, link, node, labelNode, color, label
        ,adjlist, labelLayout, graphLayout
        ,objEW;            

        this.init = function () {
            
            color = d3.scaleOrdinal(d3.schemeCategory10);

            // set the dimensions and margins of the diagram
            var margin = {top: 40, right: 90, bottom: 50, left: 90};
            me.width = me.width - margin.left - margin.right;
            me.height = me.height - margin.top - margin.bottom;

            // declares a tree layout and assigns the size
            var treemap = d3.tree()
                .size([me.width, me.height]);

            //  assigns the data to a hierarchy using parent-child relationships
            var nodes = d3.hierarchy(me.data);

            // maps the node data to the tree layout
            nodes = treemap(nodes);

            // append the svg obgect to the body of the page
            // appends a 'group' element to 'svg'
            // moves the 'group' element to the top left margin
            var svg = me.cont.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom),
                g = svg.append("g")
                .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

            // adds the links between the nodes
            var link = g.selectAll(".link")
                .data( nodes.descendants().slice(1))
            .enter().append("path")
                .attr("class", "link")
                .attr("d", function(d) {
                return "M" + d.x + "," + d.y
                    + "C" + d.x + "," + (d.y + d.parent.y) / 2
                    + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2
                    + " " + d.parent.x + "," + d.parent.y;
                });

            // adds each node as a group
            var node = g.selectAll(".node")
                .data(nodes.descendants())
            .enter().append("g")
                .attr("class", function(d) { 
                return "node" + 
                    (d.children ? " node--internal" : " node--leaf"); })
                .attr("transform", function(d) { 
                return "translate(" + d.x + "," + d.y + ")"; });

            // adds the circle to the node
            node.append("circle")
            .attr("r", 10);

            // adds the text to the node
            node.append("text")
            .attr("dy", ".35em")
            .attr("y", function(d) { return d.children ? -20 : 20; })
            .style("text-anchor", "middle")
            .text(function(d) { return d.data.name; });         
                           
        }

        this.hide = function(){
          svg.attr('visibility',"hidden");
        }
        this.show = function(){
          svg.attr('visibility',"visible");
        }

        function fctExecute(p) {
            switch (p.data.fct) {
                case 'showRoueEmotions':
                  me.hide();
                  if(!objEW)
                    objEW = new emotionswheel({'idCont':me.cont.attr('id'),'width':me.width,'height':me.width});
                  else
                    objEW.show();
                  break;
                default:
                  console.log(p);
            }            
        }            

        if(me.dataUrl){
            d3.json(me.dataUrl).then(function(graph) {
                me.data = graph;
                me.init();
            });    
        }else{
            me.init();
        }

    }
}

  


