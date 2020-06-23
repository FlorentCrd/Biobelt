import { Project } from "./project";
import { Version } from "./version";
import { Belt, TrapsColor, BottleType } from "./belt";
import { Branch } from "./branch";
import { Node, NodeType } from "./node";
import { ElectricalOutlet } from "./electricalOutlet";
import { Transformer } from "./transformer";
import { ProtectedArea } from "./protectedArea";
import { UUID } from "angular2-uuid";
import { Calculations } from "./calculations";

export class CAD {
  project: Project;
  version: Version;

  tool: Tool;
  mode: Mode = Mode.ALL;

  googleMapsParams: any = { width: 640, height: 640, scale: 2 };

  // Context menu
  contextMenuLeft: number = 0;
  contextMenuTop: number = 0;
  showContextMenu: boolean = false;

  // Diffusions
  showDiffusionParameters: boolean = false;

  // Image
  dowloadImage: boolean = false;

  // Selection
  selectedBelt: Belt;
  selectedBranch: Branch;
  selectedNodes: Node[] = [];
  selectedElectricalOutlet: ElectricalOutlet;
  selectedTransformer: Transformer;
  selectedProtectedArea: ProtectedArea;
  selectedProtectedAreaPointIndex: number;

  // Branch edition tool
  drawDistance: number = 5.5;
  drawPolyPath: any[] = [];

  // Canvas
  render: boolean = false;
  renderFactor: number = 3;
  translatePosition: any = { x: 0, y: 0 };
  startDragOffset: any = { x: 0, y: 0 };

  // Select pixels ratio
  startPixelsRatio;
  endPixelsRatio;
  metersPixelsRatio = 5;

  constructor(project: Project, version: Version) {
    this.project = project;
    this.version = version;
  }

  /* Selection */
  selectBelt(id: string) {
    var belt = this.version.getBelt(id);

    if (belt) {
      // CO2
      this.selectedBelt = belt;
      this.selectedBranch = null;
      this.selectedNodes = [];
          
      // Electric
      this.selectedElectricalOutlet = null;
      this.selectedTransformer = null;
    }

    document.dispatchEvent(new Event('CADSelectionChanged'));
  }
  unSelectBelt() {
    // CO2
    this.selectedNodes = [];
    this.selectedBranch = null;
    this.selectedBelt = null;
    
    // Electric
    this.selectedElectricalOutlet = null;
    this.selectedTransformer = null;
    
    // Protected area
    this.selectedProtectedArea = null;

    document.dispatchEvent(new Event('CADSelectionChanged'));
  }
  selectBranch(id: string) {
    var branch = this.version.getBranch(id),
        belt = this.version.getBeltFromBranch(id);

    if (branch && belt) {
      this.selectedBelt = belt;
      this.selectedBranch = branch;
      this.selectedNodes = [];
    }

    document.dispatchEvent(new Event('CADSelectionChanged'));
  }
  unSelectBranch() {
    this.selectedNodes = [];
    this.selectedBranch = null;
    document.dispatchEvent(new Event('CADSelectionChanged'));
  }
  selectNode(id: string, ctrl: boolean) {
    var node = this.version.getNode(id);

    if (node) {
      if (ctrl) {
        // Check if node already selected
        if (!this.selectedBelt) {
          this.selectNode(id, false);
          return;
        }

        // Check belt
        var branch = this.version.getBranchFromNode(id),
            belt = this.version.getBeltFromBranch(branch.id);
        
        if (this.selectedBelt.id === belt.id) {
          if (this.selectedNodes.findIndex(n => n.id === id) == -1)
            this.selectedNodes.push(node);
          else
            this.selectedNodes.splice(this.selectedNodes.findIndex(n => n.id === id), 1);
        } else {
          this.selectedNodes = [];
          this.selectNode(id, false);
        }
      } else {
        var branch = this.version.getBranchFromNode(id),
            belt = this.version.getBeltFromBranch(branch.id);
        this.selectedBelt = belt;
        this.selectedBranch = branch;
        this.selectedNodes = [];
        this.selectedNodes.push(node);
      }
    }

    // Check electricalOutlet
    if (this.selectedElectricalOutlet && this.version.getBeltFromElectricalOutlet(this.selectedElectricalOutlet.id) !== this.selectedBelt) {
      this.unSelectElectricalOutlet();
    }

    document.dispatchEvent(new Event('CADSelectionChanged'));
  }
  unSelectNode() {
    this.selectedNodes = [];
    document.dispatchEvent(new Event('CADSelectionChanged'));
  }
  selectElectricalOutlet(id: string) {
    var electricalOutlet = this.version.getElectricalOutlet(id),
        belt = this.version.getBeltFromElectricalOutlet(id);
    
    if (electricalOutlet && belt) {
      this.selectedBelt = belt;
      this.selectedElectricalOutlet = electricalOutlet;
      this.selectedTransformer = null;
      this.selectedProtectedArea = null;
    }

    document.dispatchEvent(new Event('CADSelectionChanged'));
  }
  unSelectElectricalOutlet() {
    this.selectedElectricalOutlet = null;
    this.selectedTransformer = null;
    document.dispatchEvent(new Event('CADSelectionChanged'));
  }
  selectTransformer(id: string) {
    var transformer = this.version.getTransformer(id),
        electricalOutlet = this.version.getElectricalOutletFromTransformer(id),
        belt = this.version.getBeltFromElectricalOutlet(electricalOutlet.id);

    if (transformer && electricalOutlet && belt) {
      this.selectedBelt = belt;
      this.selectedElectricalOutlet = electricalOutlet;
      this.selectedTransformer = transformer;
      this.selectedProtectedArea = null;
    }

    document.dispatchEvent(new Event('CADSelectionChanged'));
  }
  unSelectTransformer() {
    this.selectedTransformer = null;
    document.dispatchEvent(new Event('CADSelectionChanged'));
  }
  selectProtectedArea(id: string) {
    var protectedArea = this.version.getProtectedArea(id),
        belt = this.version.getBeltFromProtectedArea(id);

    if (protectedArea && belt) {
      this.selectedBelt = belt;
      this.selectedBranch = null;
      this.selectedNodes = [];
      this.selectedElectricalOutlet = null;
      this.selectedTransformer = null;

      this.selectedProtectedArea = protectedArea;
    }

    document.dispatchEvent(new Event('CADSelectionChanged'));
  }
  unSelectProtectedArea() {
    this.selectedProtectedArea = null;
    this.selectedProtectedAreaPointIndex = null;
    document.dispatchEvent(new Event('CADSelectionChanged'));
  }

  /* Zoom & Rotation */
  setZoom(zoom: number) {
    this.version.zoom = zoom;
    document.dispatchEvent(new Event('CADZoomChanged'));
  }
  setRotation(rotation: number) {
    this.version.rotation = Math.round(rotation);
    document.dispatchEvent(new Event('CADRotationChanged'));
  }

  /* MapType, Tool & Mode */
  setMapType(mapType: string) {
    this.version.mapType = mapType;
    document.dispatchEvent(new Event('CADMapTypeChanged'));
  }
  setTool(tool: Tool) {
    this.tool = tool;
    document.dispatchEvent(new Event('CADToolChanged'));
  }
  setMode(mode: string) {
    this.mode = <Mode>Mode[mode];
    document.dispatchEvent(new Event('CADModeChanged'));
  }

  /* Opacity & Icons Size */
  setOpacity(opacity) {
    if (!isNaN(parseInt(opacity))) {
      this.version.mapOpacity = parseInt(opacity);
      document.dispatchEvent(new Event('CADOpacityChanged'));
    }
  }
  setIconsSize(iconsSize) {
    if (!isNaN(parseInt(iconsSize))) {
      this.version.iconsSize = parseInt(iconsSize);
      document.dispatchEvent(new Event('CADIconsSizeChanged'));
    }
  }

  /* Validate & Abort */
  validate() {

    // Draw
    if (this.tool == Tool.DRAW) {
      // 1. Split lines to get all points possibilities
      var points = [];
      if (this.drawPolyPath.length > 0 && this.selectedNodes.length == 1 && this.version.getNodeNumberOfChild(this.selectedNodes[0].id) < 2) {
        var selectedNodePosition = this.getPosition(this.selectedNodes[0].lat, this.selectedNodes[0].lng);
        this.splitLine(
          selectedNodePosition,
          this.drawPolyPath[0],
          this.distance(selectedNodePosition.x, selectedNodePosition.y, this.drawPolyPath[0].x, this.drawPolyPath[0].y)
        ).forEach(point => { points.push(point) });
      }
      this.drawPolyPath.forEach((path, index) => {
        if (index + 1 < this.drawPolyPath.length) {
          var nextPath = this.drawPolyPath[index + 1];
          this.splitLine(path, this.drawPolyPath[index + 1], this.distance(path.x, path.y, nextPath.x, nextPath.y)).forEach(point => { points.push(point) });
        }
      });

      // Convert path to branch
      // 2. Belt has no branches
      if (this.selectedBelt.branches.length == 0) {
        // 2.1 Create a new branch
        var branch = new Branch();
        branch.id = UUID.UUID();
        this.selectedBelt.branches.push(branch);

        // 2.2 Determine traps positions
        var distance = this.drawDistance,
            prevTrap: Node;
        for (var i = 0; i < points.length; i++) {
            var position = this.getCoordinates(points[i].x, points[i].y),
                prevTrapDistance = 0;

            // Get distance beetwen previous trap
            if (prevTrap) prevTrapDistance = this.getDistance({ lat: prevTrap.lat, lng: prevTrap.lng }, position);

            // Increment distance beetween this & previous
            if (i > 0) distance += this.getDistance(position, this.getCoordinates(points[i - 1].x, points[i - 1].y));

            if ((!prevTrap && distance >= this.drawDistance) || prevTrapDistance >= this.drawDistance) {
              // Add
              var node = new Node();
              node.id = UUID.UUID();
              node.nodeType = prevTrap ? NodeType.HEXAGONAL_TRAP : NodeType.CONTROL;
              node.prevDistance = i == 0 ? 0 : distance;
              node.lat = position.lat;
              node.lng = position.lng;
              branch.nodes.push(node);

              // Angle calculation
              if (i > 0) node.textAngle = this.angleCalculation({ x: points[i].x, y: points[i].y }, { x: points[i - 1].x, y: points[i - 1].y });

              prevTrap = node;
              distance = 0;
            }
        }

        // 2.3 Check if branch has nodes
        if (branch.nodes.length == 0) this.version.delBranch(branch.id);
      }


      // 3. Selected node & node children < 2
      if (this.selectedNodes.length == 1 && this.version.getNodeNumberOfChild(this.selectedNodes[0].id) < 2) {
        // Get node index
        var nodeIndex = this.version.getNodeIndex(this.selectedNodes[0].id),
            nodesLength = this.selectedBranch.nodes.length;

        // 3.1 Last node of his branch
        if (nodeIndex == nodesLength - 1) {
          // 3.1.1 Distance between selected node & first point of the path
          var distance = this.getDistance({
            lat: this.selectedNodes[0].lat,
            lng: this.selectedNodes[0].lng
          }, this.getCoordinates(points[0].x, points[0].y)),
          prevTrap: Node;

          // 3.1.2 Add nodes
          for (var i = 0; i < points.length; i++) {
            var position = this.getCoordinates(points[i].x, points[i].y),
                prevTrapDistance = 0;

            // Get distance beetwen previous trap
            if (prevTrap) prevTrapDistance = this.getDistance({ lat: prevTrap.lat, lng: prevTrap.lng }, position);
            
            // Increment distance between this & previous
            if (i > 0) distance += this.getDistance(position, this.getCoordinates(points[i - 1].x, points[i - 1].y));

            if ((!prevTrap && distance >= this.drawDistance) || prevTrapDistance >= this.drawDistance) {
              // Get distance between last node
              if (i == 0) {
                var lastNode = this.selectedBranch.nodes[this.selectedBranch.nodes.length - 1],
                    prevNodeDistance = this.getDistance(position, {lat: lastNode.lat, lng: lastNode.lng});
                    
                // Add
                var node = new Node();
                node.id = UUID.UUID();
                node.prevDistance = prevNodeDistance;
                node.lat = position.lat;
                node.lng = position.lng;

                // Angle calculation
                if (i > 0) node.textAngle = this.angleCalculation({ x: points[i].x, y: points[i].y }, { x: points[i - 1].x, y: points[i - 1].y });

                this.selectedBranch.nodes.push(node);
              } else {
                // Add
                var node = new Node();
                node.id = UUID.UUID();
                node.prevDistance = distance;
                node.lat = position.lat;
                node.lng = position.lng;

                // Angle calculation
                if (i > 0) node.textAngle = this.angleCalculation({ x: points[i].x, y: points[i].y }, { x: points[i - 1].x, y: points[i - 1].y });

                this.selectedBranch.nodes.push(node);
              }
              prevTrap = node;
              distance = 0;
            }
          }
        }

        // 3.2 Not last node of his branch
        else {
          // Create a new branch
          var branch = new Branch();
          branch.id = UUID.UUID();
          this.selectedBelt.branches.push(branch);

          // Set parentBranch & parentNode
          branch.parentBranch = this.selectedBranch.id;
          branch.parentNode = this.selectedNodes[0].id;
          
          // Distance between selected node & first point of the path
          var distance = this.getDistance({ lat: this.selectedNodes[0].lat, lng: this.selectedNodes[0].lng }, this.getCoordinates(points[0].x, points[0].y)),
              prevTrap: Node;
          
          // Add nodes
          for (var i = 0; i < points.length; i++) {
            var position = this.getCoordinates(points[i].x, points[i].y),
                prevTrapDistance = 0;

            // Get distance beetwen previous trap
            if (prevTrap) prevTrapDistance = this.getDistance({ lat: prevTrap.lat, lng: prevTrap.lng }, position);
            
            // Increment distance betwen this & previous
            if (i > 0) distance += this.getDistance(position, this.getCoordinates(points[i - 1].x, points[i - 1].y));
            
            if ((!prevTrap && distance >= this.drawDistance) || prevTrapDistance >= this.drawDistance) {
              // Get distance between last node
              if (i == 0) {
                var prevNodeDistance = this.getDistance(position, { lat: this.selectedNodes[0].lat, lng: this.selectedNodes[0].lng });
                
                // Add
                var node = new Node();
                node.id = UUID.UUID();
                node.prevDistance = prevNodeDistance;
                node.lat = position.lat;
                node.lng = position.lng;

                // Angle calculation
                if (i > 0) node.textAngle = this.angleCalculation({ x: points[i].x, y: points[i].y }, { x: points[i - 1].x, y: points[i - 1].y });

                branch.nodes.push(node);
              } else {
                // Add
                var node = new Node();
                node.id = UUID.UUID();
                node.prevDistance = distance;
                node.lat = position.lat;
                node.lng = position.lng;

                // Angle calculation
                if (i > 0) node.textAngle = this.angleCalculation({ x: points[i].x, y: points[i].y }, { x: points[i - 1].x, y: points[i - 1].y });

                branch.nodes.push(node);
              }
              prevTrap = node;
              distance = 0;
            }
          }
        }
      }

      this.drawPolyPath = [];
      this.setTool(null);
      this.unSelectNode();
      document.dispatchEvent(new Event('CADDrawChanged'));
    }

    // Select pixels ratio
    else if (this.tool == Tool.SELECT_PIXELS_RATIO) {
      if (this.startPixelsRatio && this.endPixelsRatio && !isNaN(this.metersPixelsRatio)) {
        this.project.customPictureRatio = this.distance(
          this.startPixelsRatio.x, this.startPixelsRatio.y,
          this.endPixelsRatio.x, this.endPixelsRatio.y
        ) / this.metersPixelsRatio;
        this.setTool(null);
      }
    }

  }
  abort() {
    this.drawPolyPath = [];
    this.setTool(null);
    document.dispatchEvent(new Event('CADDrawChanged'));
  }
  trapsRecalculations() {
    // 1. Get branch
    var branch = this.version.getBranchFromNode(this.selectedNodes[0].id);


    // 2. Get firstNode & lastNode
    var firstNode: Node, lastNode: Node;
    if (this.version.getNodeIndex(this.selectedNodes[0].id) < this.version.getNodeIndex(this.selectedNodes[1].id)) firstNode = this.selectedNodes[0], lastNode = this.selectedNodes[1];
    else firstNode = this.selectedNodes[1], lastNode = this.selectedNodes[0];


    // 3. Get firstNodeIndex & lastNodeIndex
    var firstNodeIndex = this.version.getNodeIndex(firstNode.id),
        lastNodeIndex = this.version.getNodeIndex(lastNode.id);


    // 4. Convert branch to path
    var path: any[] = [];
    path.push(this.getPosition(firstNode.lat, firstNode.lng));
    for (var i = firstNodeIndex + 1; i < lastNodeIndex; i++) {
      // TODO: Check if angle between prev, this & next != 180 before add to path
      path.push(this.getPosition(branch.nodes[i].lat, branch.nodes[i].lng));
    }
    path.push(this.getPosition(lastNode.lat, lastNode.lng));

    // 5. Delete all nodes
    this.version.delNodeFromElectricalBranch(firstNode.id);
    branch.nodes.splice(firstNodeIndex + 1, lastNodeIndex - firstNodeIndex);


    // 5. Split lines to get all points possibilities
    var points = [];
    path.forEach((p, index) => {
      if (index + 1 < path.length) {
        var nextPath = path[index + 1];
        this.splitLine(p, path[index + 1], this.distance(p.x, p.y, nextPath.x, nextPath.y)).forEach(point => { points.push(point) });
      }
    });


    // 6. Add nodes
    var distance = 0, prevTrap: Node = firstNode;
    for (var i = 0; i < points.length; i++) {
      var position = this.getCoordinates(points[i].x, points[i].y),
          prevTrapDistance = 0;

      // Get distance beetwen previous trap
      prevTrapDistance = this.getDistance({ lat: prevTrap.lat, lng: prevTrap.lng }, position);
      
      // Increment distance between this & previous
      if (i > 0) distance += this.getDistance(position, this.getCoordinates(points[i - 1].x, points[i - 1].y));

      if (prevTrapDistance >= this.drawDistance) {
        // Add
        var node = new Node();
        node.id = UUID.UUID();
        node.prevDistance = distance;
        node.lat = position.lat;
        node.lng = position.lng;

        // Angle calculation
        if (i > 0) node.textAngle = this.angleCalculation({ x: points[i].x, y: points[i].y }, { x: points[i - 1].x, y: points[i - 1].y });

        branch.nodes.splice(this.version.getNodeIndex(prevTrap.id) + 1, 0, node);
        prevTrap = node;
        distance = 0;
      }
    }

    this.unSelectNode();
    document.dispatchEvent(new Event('CADBeltChanged'));
  }
  selectParentNode() {
    this.setTool(Tool.SELECT_PARENT_NODE);
  }


  /* Setters */
  setSelectedBeltTrapsColor(trapsColor: TrapsColor) {
    this.selectedBelt.trapsColor = trapsColor;
    document.dispatchEvent(new Event('CADBeltChanged'));
  }
  setSelectedBeltName(name: string) {
    this.selectedBelt.name = name;
  }
  setSelectedBeltBottleType(bottleType: BottleType) {
    this.selectedBelt.bottleType = bottleType;

    // Set prices default values
    if (bottleType == BottleType.R100 || bottleType == BottleType.R180) {
      this.selectedBelt.co2KgPrice = 4.04;
      this.selectedBelt.co2MonthRentPrice = 60;
    } else {
      this.selectedBelt.co2KgPrice = 5.43;
      this.selectedBelt.co2MonthRentPrice = 4;
    }
  }
  setSelectedBeltCo2KgPrice(co2KgPrice: number) {
    if (!isNaN(co2KgPrice) && co2KgPrice > -1) {
      this.selectedBelt.co2KgPrice = co2KgPrice;
    }
  }
  setSelectedBeltCo2MonthRentPrice(co2MonthRentPrice: number) {
    if (!isNaN(co2MonthRentPrice) && co2MonthRentPrice > -1) {
      this.selectedBelt.co2MonthRentPrice = co2MonthRentPrice;
    }
  }
  setSelectedBeltControlSheltered(controlSheltered: boolean) {
    this.selectedBelt.controlSheltered = controlSheltered;
    document.dispatchEvent(new Event('CADBeltChanged'));
  }
  setSelectedBranchWidth(width: number) {
    if (!isNaN(width) && width > -1) {
      this.selectedBranch.width = width;
      document.dispatchEvent(new Event('CADBeltChanged'));
    }
  }
  setSelectedBranchColor(color: string) {
    this.selectedBranch.color = color;
    document.dispatchEvent(new Event('CADBeltChanged'));
  }
  setSelectedBranchNumbersColor(numbersColor: string) {
    this.selectedBranch.numbersColor = numbersColor;
    document.dispatchEvent(new Event('CADBeltChanged'));
  }
  setSelectedBranchSuffix(suffix: string) {
    this.selectedBranch.suffix = suffix;
    document.dispatchEvent(new Event('CADBeltChanged'));
  }
  setSelectedBranchTubeDiameter(tubeDiameter: number) {
    if (!isNaN(tubeDiameter) && tubeDiameter > -1) {
      this.selectedBranch.tubeDiameter = parseInt(tubeDiameter.toString());
      document.dispatchEvent(new Event('CADBeltChanged'));
    }
  }
  setSelectedBranchParentNode(id: string) {
    // Get node
    var node = this.version.getNode(id),
        nodeBranch = this.version.getBranchFromNode(id);

    // Check if node & nodeBranch exists
    if (!node || !nodeBranch) return;

    // Check if belt is the one selected
    var belt = this.version.getBeltFromBranch(nodeBranch.id);
    if (!belt || belt.id !== this.selectedBelt.id) return;

    // Check if nodeBranch isn't the selectedBranch
    if (nodeBranch.id === this.selectedBranch.id) return;

    // Check node number of child
    if (this.version.getNodeNumberOfChild(id) == 2) return;

    // Set node as parentNode
    this.selectedBranch.parentBranch = nodeBranch.id;
    this.selectedBranch.parentNode = node.id;

    // Update distance
    this.selectedNodes[0].prevDistance = this.getDistance(
      { lat: this.selectedNodes[0].lat, lng: this.selectedNodes[0].lng },
      { lat: node.lat, lng: node.lng }
    );
    
    this.selectNode(node.id, true);
    this.setTool(null);
    document.dispatchEvent(new Event('CADBeltChanged'));
  }
  setSelectedNodeTextAngle(textAngle: number) {
    if (!isNaN(textAngle) && textAngle > -1) {
      this.selectedNodes[0].textAngle = textAngle;
      document.dispatchEvent(new Event('CADBeltChanged'));
    }
  }
  setSelectedNodeTextDistance(textDistance: number) {
    if (!isNaN(textDistance) && textDistance > -1) {
      this.selectedNodes[0].textDistance = parseFloat(textDistance.toString());
      document.dispatchEvent(new Event('CADBeltChanged'));
    }
  }
  setSelectedNodeType(nodeType: NodeType) {
    this.selectedNodes[0].nodeType = nodeType;
    document.dispatchEvent(new Event('CADBeltChanged'));
  }
  setSelectedNodePrevLinkBuried(prevLinkBuried: boolean) {
    this.selectedNodes[0].prevLinkBuried = prevLinkBuried;
    document.dispatchEvent(new Event('CADBeltChanged'));
  }
  setSelectedNodesTextAngle(textAngle: number) {
    if (!isNaN(textAngle) && textAngle > -1) {
      this.selectedNodes.forEach(node => { node.textAngle = textAngle });
      document.dispatchEvent(new Event('CADBeltChanged'));
    }
  }
  setSelectedNodesTextDistance(textDistance: number) {
    if (!isNaN(textDistance) && textDistance > -1) {
      this.selectedNodes.forEach(node => { node.textDistance = parseFloat(textDistance.toString()) });
      document.dispatchEvent(new Event('CADBeltChanged'));
    }
  }
  setSelectedNodesNodeType(nodeType: NodeType) {
    this.selectedNodes.forEach(node => {
      if (node.nodeType != NodeType.CONTROL)
        node.nodeType = nodeType;
    });
    document.dispatchEvent(new Event('CADBeltChanged'));
  }
  setSelectedTransformerAngle(angle: number) {
    if (!isNaN(angle) && angle > -1) {
      this.selectedTransformer.angle = angle;
      document.dispatchEvent(new Event('CADBeltChanged'));
    }
  }
  setSelectedTransformerElectricCase(electricCase: boolean) {
    this.selectedTransformer.electricCase = electricCase;
    document.dispatchEvent(new Event('CADBeltChanged'));
  }
  setSelectedProtectedAreaWidth(width: number) {
    if (!isNaN(width) && width > -1) {
      this.selectedProtectedArea.width = parseFloat(width.toString());
      document.dispatchEvent(new Event('CADProtectedAreaChanged'));
    }
  }
  setSelectedProtectedAreaColor(color: string) {
    this.selectedProtectedArea.color = color;
    document.dispatchEvent(new Event('CADProtectedAreaChanged'));
  }

  /* Methods */
  delBelt(id: string) {
    this.version.delBelt(id);
    this.unSelectBelt();
  }
  addNodeBefore() {
    var node = new Node(),
        index = this.version.getNodeIndex(this.selectedNodes[0].id);
    node.id = UUID.UUID();
    node.lat = this.selectedNodes[0].lat + 0.000025;
    node.lng = this.selectedNodes[0].lng + 0.000025;

    this.version.addNode(node, this.selectedBranch, index);

    this.showContextMenu = false;
    this.selectNode(node.id, false);
  }
  addNodeAfter() {
    var node = new Node(),
        index = this.version.getNodeIndex(this.selectedNodes[0].id);
    node.id = UUID.UUID();
    node.lat = this.selectedNodes[0].lat + 0.000025;
    node.lng = this.selectedNodes[0].lng + 0.000025;

    this.version.addNode(node, this.selectedBranch, index + 1);

    this.showContextMenu = false;
    this.selectNode(node.id, false);
  }
  delNode() {
    this.version.delNode(this.selectedNodes[0].id);
    this.unSelectNode();
  }
  delNodeAndChildren() {
    this.version.delNodeAndChildren(this.selectedNodes[0].id);
    this.unSelectNode();
  }
  delBranch() {
    this.version.delBranch(this.selectedBranch.id);
    this.unSelectBranch();
  }
  delElectricalOutlet() {
    this.version.delElectricalOutlet(this.selectedElectricalOutlet.id);
    this.unSelectElectricalOutlet();
  }
  addTransformer() {
    var transformer = new Transformer(UUID.UUID())
    this.selectedElectricalOutlet.transformers.push(transformer);
    this.showContextMenu = false;
    document.dispatchEvent(new Event('CADBeltChanged'));
  }
  delTransformer() {
    this.version.delTransformer(this.selectedTransformer.id);
    this.unSelectTransformer();
  }
  addNodeToTransformer() {
    this.version.addNodeToTransformer(this.selectedNodes[0].id, this.selectedTransformer.id);
    document.dispatchEvent(new Event('CADBeltChanged'));
  }
  delNodeFromElectricalBranch() {
    this.version.delNodeFromElectricalBranch(this.selectedNodes[0].id);
    document.dispatchEvent(new Event('CADBeltChanged'));
  }
  delProtectedArea(id: string) {
    this.version.delProtectedArea(id);
    this.unSelectProtectedArea();
  }
  delSelectedProtectedAreaPoint() {
    this.selectedProtectedArea.points.splice(this.selectedProtectedAreaPointIndex, 1);
    this.selectedProtectedAreaPointIndex = null;
    document.dispatchEvent(new Event('CADProtectedAreaChanged')); 
  }
  addProtectedAreaPointBefore() {
    // Get current point position
    var selectedPoint = [
      this.selectedProtectedArea.points[this.selectedProtectedAreaPointIndex][0],
      this.selectedProtectedArea.points[this.selectedProtectedAreaPointIndex][1]
    ];

    var point = [selectedPoint[0] + 0.000025, selectedPoint[1] + 0.000025];

    this.selectedProtectedArea.points.splice(this.selectedProtectedAreaPointIndex, 0, point);
    this.showContextMenu = false;
    document.dispatchEvent(new Event('CADProtectedAreaChanged')); 
  }
  addProtectedAreaPointAfter() {
    // Get current point position
    var selectedPoint = [
      this.selectedProtectedArea.points[this.selectedProtectedAreaPointIndex][0],
      this.selectedProtectedArea.points[this.selectedProtectedAreaPointIndex][1]
    ];

    var point = [selectedPoint[0] + 0.000025, selectedPoint[1] + 0.000025];

    this.selectedProtectedArea.points.splice(this.selectedProtectedAreaPointIndex + 1, 0, point);
    this.showContextMenu = false;
    document.dispatchEvent(new Event('CADProtectedAreaChanged')); 
  }

  /* Calculs */
  async save(additionalDistanceSheath) {
    // First refresh calculations
    var calculations = new Calculations(this.version);
    calculations.flowCalculations(additionalDistanceSheath);
    calculations.electricCalculations(additionalDistanceSheath);
    this.version.customPictureRatio = this.project.customPictureRatio;

    // Then save locally
    localStorage.setItem('version_' + this.version.id, JSON.stringify(this.version));
  }

  /* Other functions */
  getPosition(lat, lng) {

    // Case custom picture
    if (this.project.customPicture) {
      var x = (lng - this.project.lng) * Math.cos(lat * Math.PI / 180) * 40075 / 360,
          y = (lat - this.project.lat) * 40008 / 360;

      // Convert kilometers to px
      x = x * 1000 * this.project.customPictureRatio;
      y = y * 1000 * this.project.customPictureRatio;

      return { x: x, y: y }
    }
    
    // Case google maps
    else {
      return {
        x: Math.round((lng - this.project.lng) / (360 / Math.pow(2, this.project.zoom + 9))),
        y: Math.round(-(lat - this.project.lat) / (360 / Math.pow(2, this.project.zoom + 9.1) * Math.cos(this.project.lat * Math.PI / 180)))
      }
    }
  }
  getCoordinates(x, y) {

    // Case custom picture
    if (this.project.customPicture) {
      // Convert px to kilometers
      x = (x / 1000) / this.project.customPictureRatio;
      y = (y / 1000) / this.project.customPictureRatio;

      var lat = this.project.lat + y * 360 / 40008,
          lng = this.project.lng + x * 360 / (Math.cos(lat * Math.PI / 180) * 40075);

      return { lat: lat, lng: lng }
    }
    
    // Case google maps
    else {
      return {
        lat: this.project.lat - (360 / Math.pow(2, this.project.zoom + 9.1) * Math.cos(this.project.lat * Math.PI / 180)) * y,
        lng: this.project.lng + (360 / Math.pow(2, this.project.zoom + 9)) * x
      }
    }

  }
  distance(x1, y1, x2, y2) {
    function sqr(a) { return a * a }  
    return Math.sqrt( sqr(x2 - x1) + sqr(y2 - y1) );
  }
  getDistance(latLng1, latLng2) {
    function rad(x) { return x * Math.PI / 180 }
      
    var R = 6378137, // Earth’s mean radius in meter
        dLat = rad(latLng2.lat - latLng1.lat),
        dLong = rad(latLng2.lng - latLng1.lng);
      
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(latLng1.lat)) * Math.cos(rad(latLng2.lat)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
      
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      
    var d = R * c;
      
    return d; // returns the distance in meter
  }
  angleCalculation(i, i1) {
    var c = { x: 0, y: 0 },
        d = 5,
        tgTeta = (i.y - i1.y) / (i.x - i1.x),
        teta = Math.atan((i.y - i1.y) / (i.x - i1.x)),
        yxc = tgTeta * (c.x - i.x) + i.y,
        niAngle = Math.round((yxc < c.y ? Math.sign(teta) * (Math.PI - teta) : teta) * 180 / Math.PI) + 90;

    niAngle -= niAngle % 5;

    if (niAngle < 0) return niAngle + 360;
    else return niAngle;
  }
  rotate(cx, cy, x, y, angle) {
    var radian = (Math.PI / 180) * angle,
        cos = Math.cos(radian),
        sin = Math.sin(radian),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    
    return {x: nx, y: ny};
  }
  splitLine(start, end, segments) {
    var deltaX = (end.x - start.x) / segments,
        deltaY = (end.y - start.y) / segments,
        points = [];

    points.push(start);
    for(var i = 1; i < segments; i++) {
        points.push({ x: start.x + i * deltaX, y: start.y + i * deltaY });
    }

    return points;
  }


  /*
   * Google Earth Pro
   */
  exportToKML() {

    // Init file
    var kml = '<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document>';

    // Set project name
    kml += '<name>' + this.project.name + '</name>';
    
    // Add belts
    this.version.belts.forEach(belt => {

      // Set belt name
      kml += '<Folder><name>' + belt.name + '</name>';

      // Add traps
      var trapNumber = 1;
      belt.branches.forEach(branch => {
        branch.nodes.forEach(node => {
          if (node.nodeType == NodeType.CONTROL) {
            kml += '<Placemark id="' + node.id + '"><name>Régie</name><styleUrl>#biobelt_control</styleUrl><Point><coordinates>' + node.lng + ',' + node.lat + '</coordinates></Point></Placemark>';
          } else if (node.nodeType == NodeType.HEXAGONAL_TRAP || node.nodeType == NodeType.RECTANGULAR_TRAP) {
            kml += '<Placemark id="' + node.id + '"><name>' + trapNumber + '</name><styleUrl>#biobelt_hexa_trap</styleUrl><Point><coordinates>' + node.lng + ',' + node.lat + '</coordinates></Point></Placemark>';
            trapNumber++;
          }
        });
      });

      // Add branches
      belt.branches.forEach((branch, branchIndex) => {
        kml += '<Placemark id="' + branch.id + '"><name>Branche ' + (branchIndex + 1) + '</name><styleUrl>#biobelt_branch</styleUrl><LineString><tessellate>1</tessellate><coordinates>';

        // Add nodes
        branch.nodes.forEach((node, nodeIndex) => {

          // TODO: Add parent node
          if (branchIndex > 0 && nodeIndex == 0) {
            var n = this.version.getNode(branch.parentNode);
            if (n) kml += n.lng + ',' + n.lat + ' ';
          }

          kml += node.lng + ',' + node.lat + ' ';

        });

        kml += '</coordinates></LineString></Placemark>';
      });

      kml += '</Folder>';

    });

    // Add styles
    kml +=  '<Style id="biobelt_control"><IconStyle><Icon><href>http://admin.biobelt.com/assets/img/markers/regie.png</href></Icon><scale>0.75</scale></IconStyle><LabelStyle><scale>0.75</scale></LabelStyle></Style>' +
            '<Style id="biobelt_hexa_trap"><IconStyle><Icon><href>http://admin.biobelt.com/assets/img/markers/trap_hexa_1.png</href></Icon><scale>0.75</scale></IconStyle><LabelStyle><scale>0.75</scale></LabelStyle></Style>' +
            '<Style id="biobelt_rect_trap"><IconStyle><Icon><href>http://admin.biobelt.com/assets/img/markers/trap_rect_1.png</href></Icon><scale>0.75</scale></IconStyle><LabelStyle><scale>0.75</scale></LabelStyle></Style>' +
            '<Style id="biobelt_branch"><LineStyle><color>ff0000ff</color><width>3</width></LineStyle></Style>';

    // End file
    kml += '</Document></kml>';

    return kml;

  }
}

export enum Tool {
  DRAW = 'DRAW',
  SELECT_PARENT_NODE = 'SELECT_PARENT_NODE',
  SELECT_PIXELS_RATIO = 'SELECT_PIXELS_RATIO',
}

export enum Mode {
  ALL = 'ALL',
  CO2 = 'CO2',
  ELECTRIC = 'ELECTRIC'
}