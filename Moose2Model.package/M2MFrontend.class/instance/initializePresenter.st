initialization
initializePresenter
	list
		whenSelectionChangedDo: [ :selection | 
			[ :item | 
			self draw: item.
			self changeMyTitle: item	"Change title" ]
				cull: selection selectedItem ]