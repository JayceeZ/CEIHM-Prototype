{Template {
   $classpath:'app.modules.stickywall.views.Wall',
   $css: ['app.modules.stickywall.views.css.Wall'],
   $hasScript: true
}}

	{macro main()}
		{call buildWall() /}
	{/macro}

	{macro buildWall()}
		{repeater {
			loopType: "array",
			content: postits,
			type: "div",
      id: "wall",
      attributes: {
        classList: ["wall"],
      },
      on: {
        mousedown: {fn: "onWallMouseDown", scope: this},
        mouseup: {fn: "onWallMouseUp", scope: this},
        mousemove: {fn: "onWallMouseMove", scope: this},
        touchstart: {fn: "onWallTouchStart", scope: this},
        touchmove: {fn: "onWallTouchMove", scope: this},
        touchend: {fn: "onWallTouchEnd", scope: this}
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

  {macro postit(child)}
    {var postit = child.item /}
    {var selected = (child.index === selectedPostit) ? "selected" : "" /}

    <div class="draggable ${selected}" 
        {on mousedown {fn: "onPostitMouseDown", args: child, scope: this}/}
        {on touchstart {fn: "onPostitTouchStart", args: child, scope: this}/}
        {on mousemove {fn: "onWallMouseMove", scope: this}/}>
      <div class="name">
        ${postit.name}
      </div>
      <div class="content">
        ${postit.content}
      </div>
    </div>
  {/macro}

{/Template}