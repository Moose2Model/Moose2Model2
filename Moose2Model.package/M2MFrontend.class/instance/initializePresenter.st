initialization
initializePresenter
	list
		whenSelectionChangedDo: [ :selection | [ :item | self draw: item ] cull: selection selectedItem ]