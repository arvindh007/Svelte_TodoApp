<script>
	import TodoList from './components/TodoList.svelte';
	import TodoDetails from './components/TodoDetails.svelte';
	import TodoForm from './components/TodoForm.svelte';
	
	let selectedTodo = null;
	let showForm = false;
  
	function handleTodoSelect(event) {
	  selectedTodo = event.detail;
	  showForm = false;
	}
  
	function handleEdit() {
	  showForm = true;
	}
  
	function handleRefresh() {
	  showForm = false;
	  selectedTodo = null;  // Uncommented to reset selection after refresh
	}
</script>
  
<main>
	<div class="container">
	  <div class="sidebar">
		<button 
		  class="new-todo-btn" 
		  on:click={() => {
			selectedTodo = null;
			showForm = true;
		  }}
		>
		 Add New Todo
		</button>
		<TodoList 
		  on:selectTodo={handleTodoSelect} 
		  selectedTodoId={selectedTodo?.id} 
		/>
	  </div>
	  <div class="main-content">
		{#if showForm}
		  <TodoForm 
			todo={selectedTodo} 
			on:refresh={handleRefresh}
		  />
		{:else if selectedTodo}
		  <TodoDetails 
			todo={selectedTodo} 
			on:edit={handleEdit}
			on:refresh={handleRefresh}   
		  />
		{:else}
		  <div class="empty-state">
			<p>Select a todo from the list or create a new one!!!</p>
		  </div>
		{/if}
	  </div>
	</div>
</main>
  
<style>
	.container {
	  display: flex;
	  height: 100vh;
	  padding: 20px;
	  gap: 20px;
	}
  
	.sidebar {
	  width: 300px;
	  border-right: 1px solid #ccc;
	  padding-right: 20px;
	}
  
	.main-content {
	  flex: 1;
	  padding: 20px;
	}
  
	.new-todo-btn {
	  width: 100%;
	  padding: 10px;
	  margin-bottom: 20px;
	  background-color: #4CAF50;
	  color: white;
	  border: none;
	  border-radius: 4px;
	  cursor: pointer;
	}
  
	.new-todo-btn:hover {
	  background-color: #45a049;
	}
  
	.empty-state {
	  display: flex;
	  justify-content: center;
	  align-items: center;
	  height: 100%;
	  color: #666;
	}
</style>
