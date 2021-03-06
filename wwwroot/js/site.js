﻿// Write your JavaScript code.

var $selectedNote;
var selectedNoteId;

$(document).ready(function(){

    $('.dropdown-menu').submit(function(event){
        var $title = $(this).find('[name=title]');
        var titleText = $title.val();
        $title.val("");
        $('.dropdown-toggle').dropdown('toggle');
        
        $.ajax({
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            type: "POST",
            url: "/notes",
            data: JSON.stringify({"title": titleText}),
            dataType: "json",
            success: function(data){
                createNote(data.id, data.title, data.content, data.left_pos, data.top_pos);
            }
        });
        
        return false;
    });

    loadAllNotes();

    $('.dropdown-toggle').dropdown();
});

function loadAllNotes(){
    $.ajax({
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json' 
        },
        type: "GET",
        url: "/notes",
        dataType: "json",
        success: function(data){
            for(let i=0; i < data.length; i++){
                createNote(data[i].id, data[i].title, data[i].content, data[i].left_pos, data[i].top_pos);
            }
            
            addNoteFunctions();
        }
    });
}

function addNoteFunctions(){
    $('.media-body h5').off('click').on('click', function(){
        $(this).attr('contenteditable','true');
    }).off('keyup').on('keyup', function(e){
        if(e.keyCode == 27){
            var $this = $(this);
            $this.attr('data-cancel', true);
            $this.blur();
        }
    }).off('blur').on('blur', function(){
        var $this = $(this);
        
        $this.removeAttr('contenteditable');

        //call save title method
        if(!$this.attr('data-cancel')){
            updateNote($this.parents('.media'));
        }else{
            $this.html($this.attr('data-original'));
            $this.removeAttr('data-cancel');
        }
    });

    $('.media-body p').off('click').on('click', function(){
        var $this = $(this);
        $this.parent().addClass("overflow-y");
        $this.attr('contenteditable','true').focus();
    }).off('keyup').on('keyup', function(e){
        if(e.keyCode == 27){
            var $this = $(this);
            $this.attr('data-cancel', true);
            $this.blur();
        }
    }).off('blur').on('blur', function(){
        var $this = $(this);
        $this.parent().removeClass("overflow-y");
        $this.removeAttr('contenteditable');

        //call save content method
        if(!$this.attr('data-cancel')){
            updateNote($this.parents('.media'));
            console.log('Conent saved!');
        }else{
            $this.html($this.attr('data-original'));
            $this.removeAttr('data-cancel');
        }
    });

    $('#btnDelete').off('click').on('click', function(){
        if(selectedNoteId){

            $.ajax({
                headers: { 
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                type: "DELETE",
                url: "/notes",
                data: JSON.stringify({"id": selectedNoteId}),
                dataType: "json",
                success: function(data){
                    // Delete Note by selectedNoteId
                    $('#deleteNote').modal('hide');
                    $selectedNote.remove();
                }
            });
        }
    });

    // If delete successfull then remove Note
    $('#deleteNote').off('show.bs.modal').on('show.bs.modal', function(e){
        $selectedNote = $(e.relatedTarget).parents('.media');
        selectedNoteId = $selectedNote.attr('id');
        $(this).find('.modal-body p').html("Are you sure you want to delete Note: \""+$selectedNote.find('.header h5').text()+"\"?");
    }).off('hidden.bs.modal').on('hidden.bs.modal', function(e){
        $selectedNote = null;
        selectedNoteId = null;
    });

    $(".media").draggable({ 
        handle: "#drag_here",
        containment: "parent",
        stack: ".media",
        stop: function(event, ui) {
            updateNote($(ui.helper[0]));
        }
    });
    $(".media #drag_here").disableSelection();
}

function updateNote($this){
    var id = $this.attr('id');
    var title = $this.find('.header h5').text();
    var content = $this.find('.body p').text();
    var left_pos = parseInt($this.css('left'));
    var top_pos = parseInt($this.css('top'));

    $.ajax({
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json' 
        },
        type: "PUT",
        url: "/notes",
        data: JSON.stringify({"id": id, "title": title, "content": content, "left_pos": left_pos, "top_pos": top_pos}),
        dataType: "json",
        success: function(data){
            // createNote(data.id, data.title, data.content, data.left_pos, data.top_pos);
            // alert('Updated Note!')
        }
    });
}

function createNote(id, title, content = "", x = 10, y = 10){
    
    var maxZ = Math.max.apply(null, 
        $.map($('.media'), function(e,n) {
            if($(e).css('position') != 'static')
                return parseInt($(e).css('z-index')) || 1;
        }));

    var media = $("<div></div>").addClass("media form-control d-inline-block p-0").attr('id', id);
    var drag_here = $("<div></div>").addClass("row justify-content-end m-0 p-0").attr("id", "drag_here");
    var button = $("<button>").addClass("close").attr("type", "button").attr("aria-label", "Close").attr("data-toggle", "modal").attr("data-target", "#deleteNote");
    var span = $("<span>&times;</span>").attr("aria-hidden", true);
    var media_body = $("<div></div>").addClass("media-body");
    var header = $("<div></div>").addClass("header my-1");
    var h5 = $("<h5></h5>").addClass("col-12 d-inline-block m-0 p-1 pl-2").attr("data-original", title).html(title);
    var body = $("<div></div>").addClass("body m-0");
    var p = $("<p></p>").addClass("px-3 pb-3 mb-0").attr("data-original", content).html(content);

    button.append(span);
    drag_here.append(button)
    header.append(h5);
    body.append(p);
    media_body.append(header).append(body);
    media.append(drag_here).append(media_body);

    $(".body-content").append(media);

    media.parent().css({position: 'relative'});
    media.css({top: y, left: x, position:'absolute', 'z-index': (maxZ+1)});

    addNoteFunctions();
}