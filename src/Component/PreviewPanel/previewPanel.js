import React, { useContext } from 'react'
import { pageDesignContext } from '../../Context/contexts'
import prvp from './previewpanel.module.css'
import './commonPrev.css'
import './builderstyle.css'
import { useRef } from 'react'
import { set, get } from "lodash";

/**Element utiities */
import AnimationOptionsPanel from './AddAnimations/animationOptionsPanel'
import AddLink from './AddLink/addLink'
// import * as ReactDOM from 'react-dom/client';
import parse from 'html-react-parser';
import { useState } from 'react'


export default function PreviewPanel() {

    let pageDesignState = useContext(pageDesignContext);
    let ElementSwitcher = useRef();
    let ElementNodeSelector = useRef(null);
    let dragEnterSelector = useRef(null);
    let elChangeTimer = useRef(null);
    let elementalOptions = useRef(null);
    let elementalOptionsSettings = useRef(null);
    let [panelSettings, setPanelSettings] = useState({ panelTitle: "Animation", panelMode: "animation" })

    let colorsRange = ["#bbbbbb"];
    let colorPallets = ["#072ac8", "#1e96fc", "#f95738", "#2ec4b6", "#80ed99", "#36ca00", "#b744b8"];

    let prevW = { width: "500px", overflowY: "auto" };
    if (pageDesignState.design.pageMode) {
        prevW = {
            minWidth: "1200px",
            overflow: "auto",
            width: "100%"
        }
    }
    const enableNewAdding = (e) => {
        // //console.log("enableNewAdding : 32");
        // //console.log(e.target.classList.value.indexOf("temp_elem"), e.target.classList.value.indexOf("temp_infocus"));
        // if (e.target.classList.value.indexOf("temp_elem") > -1 && e.target.classList.value.indexOf("temp_infocus") < 0) {
        // //console.log("seems to be true");
        dragEnterSelector.current = e.target.getAttribute("data-path");
        e.target.classList.add("temp_infocus");
        // }
    }

    const updateInsertPosition = (e) => {
        // //console.log("updateInsertPosition : 41");

        let _msg = document.createElement("div");
        _msg.classList = "temp_add_here";
        _msg.innerHTML = "<i class=\"las la-plus-circle\"></i>";
        _msg.onMouseEnter = enableNewAdding;

        removeGuides();

        let _sizes = e.target.closest("section").getBoundingClientRect();
        ////console.log(e.target.getBoundingClientRect(), e.clientY, _sizes.y + (_sizes.height * 0.2), _sizes.y + (_sizes.height * 0.8))

        if (e.clientY <= (_sizes.y + (25))) {
            // TODO : Element Adding helper
            //e.target.closest("div[data-prevpanel]").insertBefore(_msg, e.target.closest("section"));
            let dropIndex = +e.target.closest("section").getAttribute("data-elposition");
            pageDesignState.dropPosition.current = dropIndex;
            pageDesignState.nodeLevel.current = null;

        } else if (e.clientY >= _sizes.y + (_sizes.height - 25)) {
            // TODO : Element Adding helper
            //e.target.closest("section").insertAdjacentElement("afterend", _msg);
            let dropIndex = +e.target.closest("section").getAttribute("data-elposition");
            pageDesignState.dropPosition.current = dropIndex + 1;
            pageDesignState.nodeLevel.current = null;
        } else {
            //insert it inside the element
            ////console.log("In the range")
            let dpa;
            if (e.target.hasAttribute("data-path")) {
                dpa = (e.target.getAttribute("data-path"))
            }
            else {
                dpa = (e.target.closest("[data-path]").getAttribute("data-path"))
            }
            pageDesignState.nodeLevel.current = dpa;
            pageDesignState.dropPosition.current = null
        }



    }

    const removeGuides = (e) => {
        ////console.log('removed all');
        let _rem_elems = document.querySelectorAll(".temp_add_here");
        for (let j = 0; j < _rem_elems.length; j++) {
            _rem_elems[j].remove()
        }
    }

    /**
     * we need to use React.createElement instead
     * So, this was a good waste of time :|
    */
    // const generateHTMLComp = (e, p) => {

    //     let _el = document.createElement(e.elemType);
    //     _el.className = e.classList;
    //     _el.onMouseEnter = enableNewAdding;
    //     _el.setAttribute("data-node", p);
    //     if (e.hasOwnProperty("inHTML")) _el.append(e.inHTML);

    //     // //check if has subelement
    //     if (e.elements.length > 0) {
    //         //has sub elem
    //         for (let i = 0; i < e.elements.length; i++) {
    //             _el.append(generateHTMLComp(e.elements[i], p + `${i},`));
    //         }
    //     }
    //     return _el;
    // }

    const MultiHTMLComp = (props) => {
        // //console.log(props);
        return (
            <>
                {
                    props.e.map((el, i) => {
                        let htmlCon = "";
                        if (el.hasOwnProperty("inHTML")) htmlCon = el.inHTML;
                        return (<GenerateHTMLComp element={el} datapath={props.datapath + i + ','} key={props.datapath + i + ','} >{htmlCon}</GenerateHTMLComp>)
                    })
                }
            </>
        )
    }

    const previewOutlineElement = (e) => {
        let clr = colorsRange[Math.floor(colorsRange.length * Math.random())];
        //e.target.style.border = "2px dashed " + clr;
    }

    const hideOutlineElement = (e) => {
        e.target.style.border = "";
    }

    const selectElementActive = (e) => {



        // //console.log("selectElementActive : 133", e.target);
        //check if content is editable
        let elms = document.querySelectorAll('.temp_infocus');
        if (elms.length) {
            for (let el of elms) {
                el.classList.remove("temp_infocus");
            }
        }


        let elmsEd = document.querySelectorAll('.editable_infocus');
        if (elmsEd.length) {
            for (let el of elmsEd) {
                el.style.outline = "none"
                el.classList.remove("editable_infocus");
            }
        }


        if ((e.target.getAttribute("contenteditable") === "true" && e.target.hasAttribute("data-path")) || (e.target.closest("[data-path]").getAttribute("contenteditable") === "true" && !e.target.hasAttribute("data-path"))) {
            if (e.target.hasAttribute("data-path")) {
                e.target.classList.add("editable_infocus");
                //lets make consistancy for the color
                let _dp = e.target.getAttribute("data-path");
                // //console.log(_dp);
                _dp = _dp.substring(0, _dp.length - 1);
                _dp = _dp.split(',');
                _dp = _dp.reduce((a, b) => a += b);
                _dp = _dp % colorPallets.length;
                // e.target.style.outline = "2px solid " + colorPallets[Math.floor(Math.random() * colorPallets.length)]
                e.target.style.outline = "2px solid " + colorPallets[_dp];
                // //console.log("color pallet at", _dp, colorPallets[_dp])
            } else {
                // //console.log("Get the nearest data path")
                e.target.closest("[data-path]").classList.add("editable_infocus");
                //lets make consistancy for the color
                let _dp = e.target.closest("[data-path]").getAttribute("data-path");
                // //console.log(_dp);
                _dp = _dp.substring(0, _dp.length - 1);
                _dp = _dp.split(',');
                _dp = _dp.reduce((a, b) => a += b);
                _dp = _dp % colorPallets.length;
                // e.target.style.outline = "2px solid " + colorPallets[Math.floor(Math.random() * colorPallets.length)]
                e.target.closest("[data-path]").style.outline = "2px solid " + colorPallets[_dp];
                // //console.log("color pallet at", _dp, colorPallets[_dp])
            }
        }
        if (e.target.getAttribute("contenteditable") === "false") {

            e.target.classList.add("temp_infocus");
        }

        ElementSwitcher.current.style.display = "block";
        let parentPosition = document.querySelector("[data-panelmain]").getBoundingClientRect();
        //scroll top fix
        let scrlTop = document.querySelector("[data-panelmain]").scrollTop;
        //fixed when you click on sub element it is still going to be a top level position
        let boxPosition = (e.target.hasAttribute("data-path")) ? e.target.getBoundingClientRect() : e.target.closest("[data-path]").getBoundingClientRect();
        let posLeft = (boxPosition.x - parentPosition.x - 30);
        let posBottom = (boxPosition.y - parentPosition.y);
        // //console.log(boxPosition);
        // //console.log(posBottom, (parentPosition.bottom - 127 - parentPosition.y), " /cond:  ", (posBottom + parentPosition.y + 127), (parentPosition.bottom));
        ElementSwitcher.current.style.left = (boxPosition.x > parentPosition.x) ? posLeft + "px" : (posLeft + 30) + "px";
        ElementSwitcher.current.style.top = scrlTop + posBottom + "px";


        //elementalOptionsSettings.current.style.display = "none";


        /**
         * 
         * This shows respective options for the element!
         */
        //make the optios visible on elemental click

        elementalOptions.current.style.display = "block";
        //now get element width
        let optionsPanelWidth = elementalOptions.current.getBoundingClientRect();
        elementalOptions.current.style.left = (optionsPanelWidth.right > window.innerWidth) ? (window.innerWidth - optionsPanelWidth) + "px" : (posLeft + 40) + "px";
        elementalOptions.current.style.top = ((scrlTop + posBottom - optionsPanelWidth.height) < (parentPosition.top)) ? (scrlTop + posBottom + boxPosition.height) + "px" : (scrlTop + posBottom - optionsPanelWidth.height) + "px";


        let nodeP;
        if (e.target.hasAttribute("[data-path]")) {
            nodeP = e.target.getAttribute("data-path");
        } else {

            nodeP = e.target.closest("[data-path]").getAttribute("data-path");
        }

        //181
        // //console.log("Current elem set to", nodeP);
        ElementNodeSelector.current = nodeP.substring(0, nodeP.length - 1);
        // /layout_panel_options

    }

    const moveElUp = () => {
        //moves element one step up
        let _elNode = ElementNodeSelector.current;
        _elNode = _elNode.split(',');
        let _elNodeLast = _elNode[_elNode.length - 1];
        if (_elNodeLast < 1) {
            alert("Cant move up, as It is already a first element of the section");
            return;
        }

        _elNode = _elNode.slice(0, -1);
        let _depth = { ...pageDesignState.design }

        if (_elNode.length > 0) {
            //get parent node
            let _parent_node = get(_depth, 'elements[' + _elNode.join('].elements[') + '].elements');

            //switch the elements
            // from=> _elNodeLast
            let from = _elNodeLast;
            // to => _elNodeLast - 1
            let to = _elNodeLast - 1;

            const _el = _parent_node.splice(from, 1)[0];
            _parent_node.splice(to, 0, _el);

            //remove last element
            // _parent_node.splice(_elNodeLast, 1);

            //remove the node
            set(_depth, 'elements[' + _elNode.join('].elements[') + '].elements', _parent_node);

            pageDesignState.setDesign(_depth);

        } else {
            let _parent_node = get(_depth, 'elements');

            //from
            let from = ElementNodeSelector.current;
            let to = ElementNodeSelector.current - 1;

            const _el = _parent_node.splice(from, 1)[0];
            _parent_node.splice(to, 0, _el);

            //directly set to empty element
            set(_depth, 'elements', _parent_node)
            pageDesignState.setDesign(_depth);


        }
        //update position for the elemenNode
        if (_elNode.length > 0) {
            ElementNodeSelector.current = _elNode.join(",") + "," + (_elNodeLast - 1) + "";
        } else {
            ElementNodeSelector.current = (_elNodeLast - 1) + "";
        }

        //select the element again after render
        let selectorStr = `[data-path="${ElementNodeSelector.current}`;
        if (selectorStr.charAt(selectorStr.length - 1) !== ',') {
            selectorStr += ',"]';
        } else {
            selectorStr += '"]'
        }
        //console.log(selectorStr);
        document.querySelector(selectorStr).classList.add("temp_infocus");

        let scrlTop = document.querySelector("[data-panelmain]").scrollTop;

        //update the position of the selector
        let parentPosition = document.querySelector("div[data-panelmain]").getBoundingClientRect();
        let boxPosition = document.querySelector(selectorStr).getBoundingClientRect();
        ElementSwitcher.current.style.left = (boxPosition.x - parentPosition.x - 26) + "px";
        ElementSwitcher.current.style.top = (scrlTop + (boxPosition.y - parentPosition.y)) + "px";

        elementalOptions.current.style.display = "none";
        elementalOptionsSettings.current.style.display = "none";
    }


    const moveElDown = () => {
        //moves element one step up
        let _elNode = ElementNodeSelector.current;
        _elNode = _elNode.split(',');
        let _elNodeLast = _elNode[_elNode.length - 1];
        _elNode = _elNode.slice(0, -1);
        let _depth = { ...pageDesignState.design }

        if (_elNode.length > 0) {
            //get parent node
            let _parent_node = get(_depth, 'elements[' + _elNode.join('].elements[') + '].elements');

            if ((_elNodeLast) > (_parent_node.length - 2)) {
                alert("Can push below the element, it is the bottommost element in the div");
                return;
            }
            //switch the elements
            // from=> _elNodeLast
            let from = _elNodeLast;
            // to => _elNodeLast + 1
            let to = _elNodeLast + 1;

            const _el = _parent_node.splice(from, 1)[0];
            _parent_node.splice(to, 0, _el);

            //remove last element
            // _parent_node.splice(_elNodeLast, 1);

            //remove the node
            set(_depth, 'elements[' + _elNode.join('].elements[') + '].elements', _parent_node);

            pageDesignState.setDesign(_depth);

        } else {
            let _parent_node = get(_depth, 'elements');

            //from
            let from = ElementNodeSelector.current;
            let to = +(ElementNodeSelector.current) + 1;

            if (to > (_parent_node.length - 1)) {
                alert("Can push below the element, it is the bottommost element in the div");
                return;
            }

            const _el = _parent_node.splice(from, 1)[0];
            _parent_node.splice(to, 0, _el);

            //directly set to empty element
            set(_depth, 'elements', _parent_node)
            pageDesignState.setDesign(_depth);


        }


        //update position for the elemenNode
        if (_elNode.length > 0) {
            ElementNodeSelector.current = _elNode.join(",") + "," + (+(_elNodeLast) + 1) + "";
        } else {
            ElementNodeSelector.current = (+(_elNodeLast) + 1) + "";
        }

        let selectorStr = `[data-path="${ElementNodeSelector.current}`;
        if (selectorStr.charAt(selectorStr.length - 1) !== ',') {
            selectorStr += ',"]';
        } else {
            selectorStr += '"]'
        }

        //select the element again after render
        document.querySelector(selectorStr).classList.add("temp_infocus");

        let scrlTop = document.querySelector("[data-panelmain]").scrollTop;
        //update the position of the selector
        let parentPosition = document.querySelector("div[data-panelmain]").getBoundingClientRect();
        let boxPosition = document.querySelector(selectorStr).getBoundingClientRect();
        ElementSwitcher.current.style.left = (boxPosition.x - parentPosition.x - 26) + "px";
        ElementSwitcher.current.style.top = (scrlTop + (boxPosition.y - parentPosition.y)) + "px";

        elementalOptions.current.style.display = "none";

        elementalOptionsSettings.current.style.display = "none";
    }

    const removeSubNode = () => {
        let _elNode = ElementNodeSelector.current;
        _elNode = _elNode.split(',');
        let _elNodeLast = _elNode[_elNode.length - 1];
        _elNode = _elNode.slice(0, -1);
        let _depth = { ...pageDesignState.design }

        if (_elNode.length > 0) {
            //get parent node
            let _parent_node = get(_depth, 'elements[' + _elNode.join('].elements[') + '].elements');

            //remove last element
            ////console.log(ElementNodeSelector.current, _elNode, _elNodeLast, 'last pos');
            _parent_node.splice(_elNodeLast, 1);

            //remove the node
            set(_depth, 'elements[' + _elNode.join('].elements[') + '].elements', _parent_node);

            pageDesignState.setDesign(_depth);

        } else {
            let _parent_node = get(_depth, 'elements');

            _parent_node.splice(ElementNodeSelector.current, 1);

            //directly set to empty element
            set(_depth, 'elements', _parent_node)
            pageDesignState.setDesign(_depth);
        }

        elementalOptions.current.style.display = "none";
        ElementSwitcher.current.style.display = "none";

        elementalOptionsSettings.current.style.display = "none";
    }

    const handleContentEdit = (e) => {
        //console.log(e);
        //console.log(e.target);
        // //console.log("Edit requested");
        if (e.target.getAttribute("contentEditable") === "true") {
            //update the state of app

            let _elPath;
            let $e;

            let _depth = { ...pageDesignState.design };
            // //console.log("Getting trig", e.target.getAttribute("data-optionstype"));
            if (e.target.getAttribute("data-optionstype") === "ListItem" && e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                //console.log("hit enterGot!");

                // let parentPos = e.target.closest('[data-optionstype="List"]').getAttribute("data-path");
                let $elms = e.target.closest('[data-optionstype="List"]').querySelectorAll("li");
                //console.log($elms);

                //node
                let setNodePath = e.target.closest('[data-optionstype="List"]').getAttribute("data-path");
                setNodePath = setNodePath.substring(0, setNodePath.length - 1)
                setNodePath = setNodePath.split(',');

                if (setNodePath.length > 0) {
                    setNodePath = "elements[" + setNodePath.join('].elements[') + "]"
                } else {
                    setNodePath = "elements"
                }

                let existingItmes = (get(_depth, setNodePath))





                if (existingItmes.elements.length < ($elms.length + 1)) {

                    if (elChangeTimer.current) clearTimeout(elChangeTimer.current);
                    set(_depth, setNodePath + ".elements", [...existingItmes.elements, {
                        previmg: "/assets/images/elements/layouts/2col.png",
                        elid: "listItem",
                        inHTML: "List item" + (existingItmes.elements.length),
                        desc: "List Item",
                        elementType: "ListItem",
                        classList: "",
                        styles: { color: "#000000" },
                        elemType: "li",
                        elemEditable: true,
                        enableDropping: false,
                        elements: [

                        ]
                    }]);

                    pageDesignState.setDesign(_depth);

                    //need to update the element to next added element, or hide showing the tools
                    ElementSwitcher.current.style.display = "none";
                    return;
                }


            }

            if (e.target.hasAttribute("data-path")) {
                _elPath = e.target.getAttribute("data-path");
                $e = e.target;
            } else {
                _elPath = e.target.closest("data-path").getAttribute("data-path");
                $e = e.target.closest("data-path");
            }
            _elPath = _elPath.substring(0, _elPath.length - 1);
            _elPath = _elPath.split(',');


            //let _depth = { ...pageDesignState.design };

            if (_elPath.length > 1) {
                // _elPath = _elPath.slice(0, -1);
                // //console.log("El path string", get(_depth, 'elements[' + _elPath.join('].elements[') + "].inHTML"))
                //console.log("will setup as ", $e.innerHTML)
                set(_depth, 'elements[' + _elPath.join('].elements[') + "].inHTML", encodeURIComponent($e.innerHTML))
            } else {
                //console.log("will setup as ", $e.innerHTML)
                set(_depth, 'elements[' + _elPath[0] + '].inHTML', encodeURIComponent($e.innerHTML));
            }
            //elChangeTimer
            //clear existing timeout
            if (elChangeTimer.current) clearTimeout(elChangeTimer.current);

            elChangeTimer.current = setTimeout(() => {
                // //console.log(_depth, 'd');
                pageDesignState.setDesign(_depth);
            }, 2000);


        }
    }

    const GenerateHTMLComp = (props) => {
        ////console.log(props, ' props');
        let e = props.element;
        let formatStyle = { ...e.styles };
        //console.log(formatStyle);
        if (formatStyle.hasOwnProperty('animationIterationCount')) formatStyle.animationIterationCount = 1;
        //console.log(formatStyle);

        let elProp = { className: e.classList, "data-path": props.datapath, onClick: (e) => selectElementActive(e), onDragEnter: (e) => enableNewAdding(e), onMouseEnter: (e) => previewOutlineElement(e), onMouseLeave: (e) => hideOutlineElement(e), onKeyUp: (e) => handleContentEdit(e), contentEditable: e.elemEditable, "data-optionstype": e.elementType, suppressContentEditableWarning: e.elemEditable, style: formatStyle };
        // let elProp = { className: e.classList, "data-path": props.datapath };
        if (e.elements.length > 0) {
            //has sub elem

            if (e.elements.length < 2) {
                //single element
                let htmlCon = "";
                if (e.hasOwnProperty("inHTML")) htmlCon = e.inHTML;
                return React.createElement(e.elemType, elProp, <GenerateHTMLComp datapath={props.datapath + '0,'} element={e.elements[0]} >{htmlCon}</GenerateHTMLComp>);
            } else {
                //more then one element
                let allElems = [];
                return React.createElement(e.elemType, elProp, <MultiHTMLComp datapath={props.datapath} e={e.elements} />);
            }

        } else {
            let htmlCon = "";
            if (e.hasOwnProperty("inHTML")) htmlCon = decodeURIComponent(e.inHTML);


            // if (e.elementType === "Headings") {
            //     //console.log(parse(htmlCon));
            //     return React.createElement(e.elemType, elProp, [parse(htmlCon)]);
            // }
            // else 
            return React.createElement(e.elemType, elProp, [parse(htmlCon)]);
            // return React.createElement(e.elemType, elProp, " " + parse(htmlCon));
        }
    }

    const updateDragPosition = (e) => {
        //console.log("updateDragPos : 460");
        let scrlTop = document.querySelector("[data-panelmain]").scrollTop;
        //position
        let parentPosition = document.querySelector("div[data-panelmain]").getBoundingClientRect();
        let ElBox = ElementSwitcher.current.getBoundingClientRect();
        ElementSwitcher.current.style.left = (e.clientX + (ElBox.width * 0.5) - parentPosition.x - 26) + "px";
        ElementSwitcher.current.style.top = (scrlTop + (e.clientY - (ElBox.height * 0.5) - (parentPosition.y))) + "px";
    }

    const moveDraggedElem = (e) => {
        //console.log("Move Drag : 470");
        let scrlTop = document.querySelector("[data-panelmain]").scrollTop;

        //position of box
        let parentPosition = document.querySelector("div[data-panelmain]").getBoundingClientRect();
        let ElBox = ElementSwitcher.current.getBoundingClientRect();
        ElementSwitcher.current.style.left = (e.clientX + (ElBox.width * 0.5) - parentPosition.x - 26) + "px";
        ElementSwitcher.current.style.top = (scrlTop + (e.clientY - (ElBox.height * 0.5) - (parentPosition.y))) + "px";

        //Append the selected element to that node
        //Current Node

        if (!ElementNodeSelector.current || !dragEnterSelector.current) {
            alert("Cant arrange in the invalid zone");
            return;
        }

        let _elNode = ElementNodeSelector.current;

        // //console.log(_elNode);
        // _elNode = _elNode.substring(0, _elNode.length - 1);
        _elNode = _elNode.split(',');
        let _elNodeLast = _elNode[_elNode.length - 1]
        _elNode = _elNode.slice(0, -1);
        // //console.log(_elNode);

        //To Place Node
        let _dSel = dragEnterSelector.current;
        _dSel = _dSel.substring(0, _dSel.length - 1);
        _dSel = _dSel.split(',');
        let _dSelLast = _dSel[_dSel.length - 1];
        _dSel = _dSel.slice(0, -1);
        // //console.log(_dSel);



        //depth
        let _depth = { ...pageDesignState.design }

        //add the removed node

        if (_dSel.length > 0 && _elNode.length > 0) {
            //get parent
            let toPlaceNodeContent = get(_depth, 'elements[' + _dSel.join('].elements[') + ']');
            let currentNodeContent = get(_depth, 'elements[' + _elNode.join('].elements[') + '].elements');

            if (!toPlaceNodeContent.enableDropping) {
                //TODO: Add this element next to this element!
                alert("Can not add sub element to this element");
                return;
            }

            toPlaceNodeContent = toPlaceNodeContent.elements;
            // //console.log(_elNodeLast, currentNodeContent);
            let currentAppendElem = currentNodeContent[_elNodeLast];
            currentNodeContent.splice(_elNodeLast, 1);



            //remove content from the current node
            set(_depth, 'elements[' + _elNode.join('].elements[') + '].elements', [...currentNodeContent]);
            //add the node into depth of new position
            set(_depth, 'elements[' + _dSel.join('].elements[') + '].elements', [...toPlaceNodeContent, currentAppendElem]);

            pageDesignState.setDesign(_depth);
        } else {
            //add on the primary level, hmm..

            //placer
            let toPlaceNodeContent;
            let currentNodeContent;

            if (_dSel.length > 0) {
                toPlaceNodeContent = get(_depth, 'elements');
                if (!_depth.enableDropping) {
                    //TODO: Add this element next to this element!
                    alert("Can not add sub element to this element");
                    return;
                }
            } else {
                toPlaceNodeContent = get(_depth, 'elements[' + _dSel.join('].elements[') + ']');

                if (!toPlaceNodeContent.enableDropping) {
                    //TODO: Add this element next to this element!
                    alert("Can not add sub element to this element");
                    return;
                }

                toPlaceNodeContent = toPlaceNodeContent.elements;
            }

            //getter
            if (_elNode.length > 0) {
                currentNodeContent = get(_depth, 'elements[' + _elNode.join('].elements[') + '].elements')
            } else {
                currentNodeContent = get(_depth, 'elements')
            }



            if (_elNode.length < 1 && _dSel.length < 1) {
                //shift the positions in the same space
                //both parent content will be same in this case. just need to switch the positions now
                //let currentAppendElem = currentNodeContent[_elNodeLast];

                currentNodeContent[_dSelLast] = currentNodeContent.splice(_elNodeLast, 1, currentNodeContent[_dSelLast])[0];

                set(_depth, 'elements', [...currentNodeContent]);
                pageDesignState.setDesign(_depth);
            } else {
                //shifting hell


                //get the appending node
                let currentAppendElem = currentNodeContent[_elNodeLast];
                currentNodeContent.splice(_elNodeLast, 1);

                // //console.log([toPlaceNodeContent, currentAppendElem], currentNodeContent, 'el');

                //set the appending node
                if (_dSel.length > 0) {
                    // //console.log("dsel1", 'elements[' + _dSel.join('].elements[') + '].elements')
                    // set(_depth, 'elements[' + _dSel.join('].elements[') + '].elements', [...toPlaceNodeContent, JSON.parse(JSON.stringify(currentAppendElem))]);
                    set(_depth, 'elements[' + _dSel.join('].elements[') + '].elements', [currentAppendElem]);
                } else {
                    // //console.log("dsel2")
                    set(_depth, 'elements', [currentAppendElem]);
                }

                //set the getter node
                if (_elNode.length > 0) {
                    // //console.log("elnd1")
                    set(_depth, 'elements[' + _elNode.join('].elements[') + '].elements', [...currentNodeContent]);
                } else {

                    // //console.log("elnd2")
                    set(_depth, 'elements', [...currentNodeContent]);
                }

                // //console.log(_depth, 'finished as');
                pageDesignState.setDesign(_depth);
            }

            ////console.log(_dSel, _elNode);


        }

        //select the active element
        //update position for the elemenNode
        if (_dSel.length > 0) {
            ElementNodeSelector.current = _dSel.join(",") + "," + (+(_dSelLast) + 1) + "";
        } else {
            ElementNodeSelector.current = (+(_dSelLast) + 1) + "";
        }

        // //console.log(`div[data-path="${dragEnterSelector.current}"]`);
        //select the element again after render
        document.querySelector(`div[data-path="${dragEnterSelector.current}"]`).classList.add("temp_infocus");

        let scrlTopp = document.querySelector("[data-panelmain]").scrollTop;

        //update the position of the selector
        let parentPositionBlock = document.querySelector("div[data-panelmain]").getBoundingClientRect();
        let boxPosition = document.querySelector(`[data-path="${dragEnterSelector.current}"]`).getBoundingClientRect();
        ElementSwitcher.current.style.left = (boxPosition.x - parentPositionBlock.x - 26) + "px";
        ElementSwitcher.current.style.top = (scrlTopp + (boxPosition.y - parentPositionBlock.y)) + "px";

        elementalOptions.current.style.display = "none";
        elementalOptionsSettings.current.style.display = "none";
    }

    const removeActiveElemStyle = () => {
        let elms = document.querySelectorAll('.temp_infocus');
        if (elms.length) {
            for (let el of elms) {
                //el.style = "";
                el.classList.remove("temp_infocus");
            }
        }

        let elmsAct = document.querySelectorAll('.editable_infocus');
        if (elmsAct.length) {
            for (let el of elmsAct) {
                // el.style.outline = "none";
                el.classList.remove("editable_infocus");
            }
        }


    }

    const showSettingsPanel = (e, name, type) => {

        setPanelSettings({ ...panelSettings, panelTitle: name, panelMode: type })

        let scrlTopp = document.querySelector("[data-panelmain]").scrollTop;
        let panelSize = document.querySelector("[data-panelmain]").getBoundingClientRect();
        elementalOptionsSettings.current.style.left = e.clientX - panelSize.left + "px";
        elementalOptionsSettings.current.style.top = scrlTopp + e.clientY + 20 - panelSize.top + "px";
        elementalOptionsSettings.current.style.display = "block"
    }

    return (
        <div className={prvp["panel_container"]}
            onMouseEnter={() => {
                ElementSwitcher.current.style.opacity = "1";
                elementalOptions.current.style.opacity = "1";
                elementalOptionsSettings.current.style.opacity = "1";
            }}
            onMouseLeave={() => {
                ElementSwitcher.current.style.opacity = "0";
                elementalOptions.current.style.opacity = "0";
                elementalOptionsSettings.current.style.opacity = "0";
                removeActiveElemStyle()
            }} data-panelmain="">
            <div data-operation="" className={prvp["layout_panel_options"]} ref={ElementSwitcher}>
                <ul className={prvp["elemental_options"]}>
                    <li className='actionBtnHover' onClick={moveElUp}><i className="las la-chevron-circle-up"></i></li>
                    <li className='actionBtnDrag' onDrag={updateDragPosition} onDragEnd={moveDraggedElem} draggable><i className="las la-arrows-alt"></i></li>
                    <li className='actionBtnHover' onClick={moveElDown}><i className="las la-chevron-circle-down"></i></li>
                    <li><hr /></li>
                    <li className='actionBtnHover' onClick={removeSubNode}><i className="las la-trash-alt"></i></li>
                </ul>
            </div>
            <div className='html_elem_option_list' ref={elementalOptions}>
                <ul>
                    <li className='actionListical'><i className="las la-palette"></i> Edit Options</li>
                    <li className='actionListical small_btn_actionListical' onClick={(e) => {

                        showSettingsPanel(e, "Animation", "animation")

                    }}><i className="las la-magic"></i></li>
                    <li className='actionListical small_btn_actionListical' ><button onClick={(e) => {

                        e.preventDefault();

                        let node = document.querySelector("[data-path=\"" + ElementNodeSelector.current + ",\"]");

                        // document.execCommand('selectAll', false, null);
                        requestAnimationFrame(() => {
                            let node = document.querySelector("[data-path=\"" + ElementNodeSelector.current + ",\"]")
                            node.focus();
                            if (document.selection) {
                                var range = document.body.createTextRange();
                                range.moveToElementText(node);
                                range.select();
                            } else if (window.getSelection) {
                                var range = document.createRange();
                                range.selectNodeContents(node);
                                window.getSelection().removeAllRanges();
                                window.getSelection().addRange(range);
                            }
                        });
                        // if (document.selection) {
                        //     var range = document.body.createTextRange();
                        //     range.moveToElementText(node);
                        //     range.select();
                        // } else if (window.getSelection) {
                        //     var range = document.createRange();
                        //     range.selectNodeContents(node);
                        //     window.getSelection().removeAllRanges();
                        //     window.getSelection().addRange(range);
                        // }


                        showSettingsPanel(e, "Link", "hyperlink");

                        /** 
                         * can we still remake the same selection?
                         */
                        // console.log(document.querySelector("[data-path=\"" + ElementNodeSelector.current + ",\"]"))
                        // if (document.selection) { // IE
                        //     var range = document.body.createTextRange();
                        //     range.moveToElementText(document.querySelector("[data-path=\"" + ElementNodeSelector.current + ",\"]"));
                        //     range.select();
                        // } else if (window.getSelection) {
                        //     var range = document.createRange();
                        //     range.selectNode(document.querySelector("[data-path=\"" + ElementNodeSelector.current + ",\"]"));
                        //     window.getSelection().removeAllRanges();
                        //     window.getSelection().addRange(range);
                        // }



                    }}><i className="las la-link"></i></button></li>
                </ul>
            </div>
            <div className='settings_panel' ref={elementalOptionsSettings}>
                <div className='setting_dragger_option'>
                    <div className='settings_dragger_title' draggable onDrag={(e) => {
                        // e.clientX;
                        // e.clientY;
                        // console.log(e.clientX, e.clientY);

                        let selfSize = elementalOptionsSettings.current.getBoundingClientRect();
                        let panelSize = document.querySelector("[data-panelmain]").getBoundingClientRect();
                        let scrlTopp = document.querySelector("[data-panelmain]").scrollTop;
                        let leftPos = (selfSize.right > (window.innerWidth - 40)) ? (window.innerWidth - selfSize.width - panelSize.left - 40) : (e.clientX - panelSize.left - (selfSize.width / 2));
                        leftPos = ((leftPos + selfSize.width) > (window.innerWidth - 40)) ? (window.innerWidth - selfSize.width - panelSize.left - 40) : leftPos
                        leftPos = (leftPos > 0) ? leftPos : "0";
                        elementalOptionsSettings.current.style.left = leftPos + "px";

                        let topPos = (selfSize.top < panelSize.top) ? 0 : (e.clientY - panelSize.top + scrlTopp - 20);

                        topPos = (topPos < panelSize.top) ? 0 : topPos;

                        // console.log(topPos, selfSize.top, panelSize.top, (e.clientY - panelSize.top + scrlTopp - 20))
                        elementalOptionsSettings.current.style.top = topPos + "px";

                    }} onDragEnd={(e) => {


                        let selfSize = elementalOptionsSettings.current.getBoundingClientRect();
                        let panelSize = document.querySelector("[data-panelmain]").getBoundingClientRect();
                        let scrlTopp = document.querySelector("[data-panelmain]").scrollTop;
                        let leftPos = (selfSize.right > (window.innerWidth - 40)) ? (window.innerWidth - selfSize.width - panelSize.left - 40) : (e.clientX - panelSize.left - (selfSize.width / 2));
                        leftPos = ((leftPos + selfSize.width) > (window.innerWidth - 40)) ? (window.innerWidth - selfSize.width - panelSize.left - 40) : leftPos
                        leftPos = (leftPos > 0) ? leftPos : "0";
                        elementalOptionsSettings.current.style.left = leftPos + "px";

                        let topPos = (selfSize.top < panelSize.top) ? 0 : (e.clientY - panelSize.top + scrlTopp);
                        elementalOptionsSettings.current.style.top = topPos + "px";
                    }

                    }>
                        {panelSettings.panelTitle}
                    </div>
                    <div className='settings_dragger_action'>
                        <span onClick={() => { elementalOptionsSettings.current.style.display = "none" }}><i className='las la-times'></i></span>
                    </div>
                </div>
                <div className='settings_dragger_content'>

                    {/**
                     * Animation Options component
                     */}
                    {(panelSettings.panelMode === "animation") ? <AnimationOptionsPanel closePanel={() => { elementalOptionsSettings.current.style.display = "none" }} currentlyActive={ElementNodeSelector} /> : ""}

                    {
                        /**
                         * adds a url node inbetween
                         */
                    }
                    {(panelSettings.panelMode === "hyperlink") ? <AddLink closePanel={() => { elementalOptionsSettings.current.style.display = "none" }} key={ElementNodeSelector + "selection"} currentlyActive={ElementNodeSelector} /> : ""}
                </div>
            </div>
            <div
                style={prevW}
                className={prvp["panel_preview"]}
                /**
                 * It changes to false and removes the ability to add element :(
                 */
                // onDragLeave={() => {
                //     pageDesignState.setDesign({ ...pageDesignState.design, isDropEnabled: false })
                //     pageDesignState.isDropModeActive.current = false;
                //     //console.log('dragging end', pageDesignState)
                // }}
                onDragEnter={() => {

                    pageDesignState.setDesign({ ...pageDesignState.design, isDropEnabled: true })
                }
                }

            >

                <div className={prvp["panel_container_inner"]} data-prevpanel="true">

                    {

                        (pageDesignState.design.elements.length) ?

                            pageDesignState.design.elements.map((e, i) => {
                                return (
                                    <section data-elid={(e.elid + "_" + i)} onDragEnter={(e) => updateInsertPosition(e)} onDragLeave={removeGuides} data-elposition={i} key={(e.elid + "_" + i)}>
                                        {/* {//console.log(e, 'ele_for_rnd')} */}
                                        <GenerateHTMLComp element={e} datapath={i + ','} />
                                        {/* {generateHTMLComp(e, i + ',')} */}
                                    </section>
                                )
                            })

                            : <section><div className="temp_elem">Create a layout</div></section>
                    }
                </div>
            </div>
        </div >
    )
}