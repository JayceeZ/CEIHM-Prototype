{Template {
   $classpath:'app.modules.walllist.views.List',
   $css: ['app.modules.walllist.views.css.List'],
   $hasScript: true
}}

	{macro main()}
    <div class="container walllist">
      <div class="list-group">
        {section {
          id : "list",
          macro : "list",
          bindRefreshTo: [{
            to : "walls",
            inside : model,
            recursive : false
          }]
        }/}
        <div class="list-group-item">
            <a class="expand" href="#" {on click { fn: "askForName", scope: this} /}>
              Créer un nouveau mur
            </a>
        </div>
      </div>
    </div>
    {call createWallDialog() /}
	{/macro}

  {macro createWallDialog()}
    {@aria:Dialog {
      id : "myDialog",
      title : "Donner un nom au nouveau mur",
      icon : "std:info",
      modal : true,
      visible : false,
      movable : true,
      macro : "wallCreationDialog",
      bind : {
        "visible" : {
          inside : model,
          to : 'createDialog'
        }
      }
    }/}
  {/macro}

  {macro wallCreationDialog()}
    {@aria:Textarea {
      label : "Nom",
      labelPos : "left",
      helptext : "Le nom du mur",
      block : true,
      labelWidth : 100,
      bind : {
        "value" : {
          inside : this.model,
          to : 'name'
        }
      }
    }/}
    <div class="btn btn-default" {on click {fn: "onValidateName", scope: this}/}>Créer</div>
  {/macro}

  {macro list()}
    {repeater {
      loopType: "array",
      content: model.walls,
      type: "div",
      attributes: {
        classList: ["wall"],
      },
      childSections : {
        id: "wall",
        type: "div",
        attributes: wallItemAttributes,
        macro: {
          name: "wallItem",
          scope: this
        }
      }
    }/}
  {/macro}

  {macro wallItem(child)}
    {var wall = child.item /}
    <a class="expand" href="#" {on click { fn: "loadWall", scope: this, args: [wall._id]} /}>
      ${wall.name} - ${new Date(wall.date).toLocaleString()}
      <span class="label label-default label-pill pull-right">${wall.postits.length} post-its</span>
    </a>
  {/macro}

{/Template}