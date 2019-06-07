initialization
initializePresenter
	"whenSelectionChangedDo:"

	list
		whenSelectionChangedDo: [ :selection | 
			[ :item | 
			self draw2: item.
			self changeMyTitle: item	"Change title" ]
				cull: selection selectedItem ]