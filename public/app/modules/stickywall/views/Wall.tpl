{Template {
   $classpath:'app.modules.stickywall.views.Wall',
   $css: ['app.modules.stickywall.views.css.Wall'],
   $hasScript: true
}}

	{macro main()}
    <div class="actions">
      {call createPostitDialog() /}
      <div class="btn btn-default" {on click {fn: "onWallMark", scope: this}/}><span class="glyphicon glyphicon-bookmark"></span>Créer un marqueur</div>
      <div class="btn btn-danger" {on click {fn: "onDeletePostit", scope: this}/}>Supprimer un Post-It</div>
    </div>
    {section {
        id: "floatings",
        macro: "floatingActions",
        bindRefreshTo: [
          {
            to: "hideActions",
            inside: model,
            recursive: false
          },
          {
            to: "wallScale",
            inside: model,
            recursive: false
          }
        ]
      }
    /}
		{call buildWall() /}
    {section {
        id: "timeline",
        macro: "timeline",
        bindRefreshTo: [
          {
            to: "showHistory",
            inside: model,
            recursive: false
          }
        ]
      }
    /}
	{/macro}

  {macro floatingActions()}
    {if model.hideActions === false}
      <div class="floatings create-postit" {on click {fn: "onCreatePostit", scope: this}/} {on tap {fn: "onCreatePostit", scope: this}/}></div>
    {/if}
    <div class="floatings zoom">
      <div class="zoom-value">${model.wallScale.toFixed(2)}</div>
      <div class="zoom-in" {on click {fn: "onZoomIn", scope: this}/} {on tap {fn: "onZoomIn", scope: this}/}></div>
      <div class="zoom-out" {on click {fn: "onZoomOut", scope: this}/} {on tap {fn: "onZoomOut", scope: this}/}></div>
    </div>
  {/macro}

	{macro buildWall()}
		{section {
      id : "wall",
      macro : "postits",
      on: {
        mousedown: {fn: "onWallMouseDown", scope: this},
        mouseup: {fn: "onWallMouseUp", scope: this},
        mousemove: {fn: "onWallMouseMove", scope: this},
        touchstart: {fn: "onWallTouchStart", scope: this},
        touchmove: {fn: "onWallTouchMove", scope: this},
        touchend: {fn: "onWallTouchEnd", scope: this}
      },
      bindRefreshTo: [{
        to : "postits",
        inside : model,
        recursive : false
      }]
    }/}
    {section {
      id : "compass",
      macro : "compass",
      bindRefreshTo: [{
        to : "x",
        inside : wallOrig,
        recursive : false
      },
      {
        to : "y",
        inside : wallOrig,
        recursive : false
      }]
    }/}
	{/macro}

  {macro compass()}
    <div class="compass">
      <div class="recenter" {on click {fn: "onRecenter", scope: this}/} {on tap {fn: "onRecenter", scope: this}/}></div>
      <div class="coordinates">
        x: ${wallOrig.x}<br />
        y: ${wallOrig.y}
      </div>
    </div>
  {/macro}

  {macro postits()}
    {repeater {
      loopType: "array",
      content: model.postits,
      type: "div",
      attributes: {
        classList: ["wall"]
      },
      childSections : {
        id: "postit",
        type: "div",
        attributes: postitAttributes,
        macro: {
          name: "postit",
          scope: this
        }
      }
    }/}
  {/macro}

  {macro createPostitDialog()}
    {@aria:Dialog {
      id : "myDialog",
      title : "Create a postit",
      icon : "std:info",
      modal : true,
      visible : false,
      movable : true,
      macro : "postitCreationDialog",
      bind : {
        "visible" : {
          inside : model,
          to : 'createDialog'
        }
      }
    }/}
  {/macro}

  {macro postitCreationDialog()}
    {@aria:Textarea {
      label : "Name",
      labelPos : "left",
      helptext : "The title of the post-it",
      block : true,
      labelWidth : 100,
      bind : {
        "value" : {
          inside : this.model.postitToEdit,
          to : 'name'
        }
      }
    }/}
    {@aria:Textarea {
      label : "Content",
      labelPos : "left",
      helptext : "The content of the post-it",
      block : true,
      labelWidth : 100,
      bind : {
      "value" : {
          inside : this.model.postitToEdit,
          to : 'content'
        }
      },
      height : 150
    }/}
    {@aria:Link {
      label: "Import a file",
      onclick: onImportFile
    }/}
    <form style="display: none;" enctype="multipart/form-data" name="formSubmit" id="formSubmit">
      <input type="file" id="fileUpload" name="file" {on change onFileChosen /} />
    </form>
    <div class="btn btn-default" {on click {fn: "onValidateCreatePostit", scope: this}/}>Create</div>
  {/macro}

  {macro postit(child)}
    {var postit = child.item /}
    {var selected = isSelected(child.index) ? "selected" : "" /}

    <div class="postit-actions ${selected}">
      {if postit.position.z !== undefined}<div class="z-level">Plan ${postit.position.z}</div>{/if}
      <div class="up" {on click {fn: "onPostitUpClick", args: child, scope: this}/}></div>
      <div class="down" {on click {fn: "onPostitDownClick", args: child, scope: this}/}></div>
    </div>
    <div id="postit-${child.index}" class="resizable draggable ${selected}" 
        {on mousedown {fn: "onPostitMouseDown", args: child, scope: this}/}
        {on mouseup {fn: "onPostitMouseUp", args: child, scope: this}/}
        {on touchstart {fn: "onPostitTouchStart", args: child, scope: this}/}
        {on touchmove {fn: "onPostitTouchMove", args: child, scope: this}/}
        {on touchend {fn: "onPostitTouchEnd", args: child, scope: this}/}
         style="overflow: hidden; 
        {if postit.size}width: ${postit.size.width}px; height: ${postit.size.height}px;{/if}">
      {if postit.file && postit.file.match(/\.(jpg|jpeg|png|gif)$/) }
        <img src="${postit.file}" style="max-width: 100%;" alt="${postit.file}" />
      {else/}
        <div class="name">
          ${postit.name}
        </div>
        <div class="content">
          ${postit.content}
        {if postit.file}
          <br />
          <a href="${postit.file}">Fichier joint "${postit.file}"</a>
        {/if}
        </div>
      {/if}
    </div>
  {/macro}

  {macro timeline()}
    {if this.model.showHistory}
      <div class="bloc-history">
        <div class="history-close" {on click {fn: "onWallHistory", scope: this}/} {on touchend {fn: "onWallHistory", scope: this}/}></div>
        {@aria:Template {
          defaultTemplate : "app.modules.stickywall.views.Timeline",
          block : true
        }/}
      </div>
    {else/}
      <div class="wall-history" {on click {fn: "onWallHistory", scope: this}/} {on touchend {fn: "onWallHistory", scope: this}/}></div>
    {/if}
  {/macro}

{/Template}