'use strict';


let loadModelText = document.getElementById("LoadedModel");
loadModelText.innerHTML = "No Model loaded";

// // const button = document.querySelector('input');
const button = document.getElementById('LoadButton');
// // const paragraph = document.querySelector('p');

button.addEventListener('click', LoadModel);

if (window.isSecureContext) {
    // window.alert('The browser context is secure. This application will work');
}
else {
    window.alert('The browser context is not secure. This application will not work');
}

async function LoadModel() {
    'use strict';
    let contents;
    // open file picker
    try {
        [fileHandle] = await window.showOpenFilePicker();

        if (fileHandle.kind === 'file') {
            // run file code
            // get file contents
            const fileData = await fileHandle.getFile();
            contents = await fileData.text();
            document.title = fileData.name;
            loadModelText.innerHTML = 'Loaded SOMIX model: ' + fileData.name;
            useStartDiagram();
            analyzeMseFile(contents);
            positionCircle(g_width, g_height);
            mouseover = true;
            draw();

        } else if (fileHandle.kind === 'directory') {
            // run directory code
        }
    } catch (err) {
        window.alert("Loading from file is not supported. This application can therefore not be used on this browser.");
        // contents = "( (SOMIX.Grouping (id: 101 )" +
        //     "   (name 'Z2MSE')" +
        //     "    (uniqueName 'sap.z2mse')" +
        //     "   (technicalType 'ABAPPackage'))" +
        //     " (SOMIX.Grouping (id: 102 )" +
        //     "  (name 'Z2MSE_DEMO_LONG_PREFIX_CL_A')" +
        //     "  (uniqueName 'sap.z2mse_demo_long_prefix_cl_a')" +
        //     "  (technicalType 'ABAPGlobalClass')" +
        //     "  (linkToEditor 'adt://T80/sap/bc/adt/oo/classes/z2mse_demo_long_prefix_cl_a/source/main'))" +
        //     "(SOMIX.ParentChild" +
        //     "  (parent (ref: 101))" +
        //     "  (child (ref: 102)))" +
        //     "(SOMIX.Code (id: 103 )" +
        //     "  (name 'LONG_MEANINGLESS_METHOD_NAME')" +
        //     "  (technicalType 'ABAPMethod')" +
        //     "  (uniqueName 'sap.z2mse_demo_long_prefix_cl_b.long_meaningless_method_name'))" +
        //     "(SOMIX.Code (id: 104 )" +
        //     "  (name 'LONG_MEANINGLESS_METHOD_NAME')" +
        //     "   (technicalType 'ABAPMethod')" +
        //     "  (uniqueName 'sap.z2mse_demo_long_prefix_cl_b.long_meaningless_method_name'))" +
        //     "(SOMIX.Data (id: 105 )" +
        //     "  (name 'END_METHOD_IMPLEMENTATION')" +
        //     "  (technicalType 'ABAPClassAttribute')" +
        //     "  (uniqueName 'sap.z2mse_ep_analyze_other_keywrd.end_method_implementation'))" +
        //     "(SOMIX.ParentChild" +
        //     "  (parent (ref: 102))" +
        //     "  (child (ref: 103))" +
        //     "  (isMain true))" +
        //     "(SOMIX.ParentChild" +
        //     "  (parent (ref: 102))" +
        //     "  (child (ref: 104))" +
        //     "  (isMain true))" +
        //     "(SOMIX.ParentChild" +
        //     "  (parent (ref: 102))" +
        //     "  (child (ref: 105))" +
        //     "  (isMain true))" +
        //     "(SOMIX.Call" +
        //     "  (caller (ref: 103))" +
        //     "  (called (ref: 104)))" +
        //     "(SOMIX.Access" +
        //     "  (accessor (ref: 103))" +
        //     "  (accessed (ref: 105))" +
        //     "  (isWrite true)" +
        //     "  (isRead true)" +
        //     "  (isDependent true)))";

        // document.title = 'Example file';
        // loadModelText.innerHTML = 'Loaded SOMIX model: ' + document.title;
        // useStartDiagram();
        // analyzeMseFile(contents);
        // positionCircle(g_width, g_height);
        // mouseover = true;
        // draw();

    }



}