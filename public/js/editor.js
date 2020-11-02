//load the doc
//current page/inital page will always be 1
var current = 1;
var url = undefined;

//add event listener to listen for any file upload
document.querySelector("#pdf-upload").addEventListener("change", function (e) {
    //get the first ulpoaded file
    var file = e.target.files[0]
    if (file.type != "application/pdf") {
        console.error(file.name, "is not a pdf file.")
        $('.container').append(`<div class="alert alert-primary" role="alert">
        ${file.name}, is not a pdf file, Please re-load choose again!
      </div>`)
        return
    }

    //load the filerLoader web api to read the file content stored on user computer
    var fileReader = new FileReader();

    //as file reader is loaded get the file content as result object
    fileReader.onload = function () {
        var typedarray = new Uint8Array(this.result);
        //save name/file content in global url var
        url = typedarray;
        //render the pdf
        var LoadingTask = pdfjsLib.getDocument(typedarray);
        LoadingTask.promise.then(function (pdf) {
            // you can now use *pdf* here
            pdf.getPage(current).then(function (page) {
                var scale = 1;
                var viewport = page.getViewport({
                    scale: scale,
                });

                var canvas = document.getElementById('the-canvas');
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                page.render(renderContext);
            });

        });

    };

    //read the file as a bufferarray
    fileReader.readAsArrayBuffer(file);
})

//render page based on number of page
//load previous or next pages
function render(){
    var LoadingTask = pdfjsLib.getDocument(url);
    LoadingTask.promise.then((pdf) => {
        pdf.getPage(current).then(function (page) {
            var scale = 1;
            var viewport = page.getViewport({
                scale: scale,
            });

            var canvas = document.getElementById('the-canvas');
            var context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext);
        });
    }).catch(err => console.log(err.message));
}

//next page
function next() {
   if(current >= 1){
    current++;
    render();
   }else{
       return;
   }
}

//previous page
function previous() {
    render();
    current--;
}



