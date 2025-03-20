<!-- App.svelte -->
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
	  selectedTodo = null;
	}
  </script>
  
  <main>
	<div class="app-wrapper">
	  <header>
		<h1>Todo App</h1>
		<button 
		  class="add-btn" 
		  on:click={() => {
			selectedTodo = null;
			showForm = true;
		  }}
		>
		  <i class="fas fa-plus"></i>
		  Create New Todo
		</button>
	  </header>
	  
	  <div class="content">
		<aside>
		  <TodoList 
			on:selectTodo={handleTodoSelect} 
			selectedTodoId={selectedTodo?.id} 
		  />
		</aside>
  
		<section class="main-section">
		  {#if showForm}
			<div class="center-content">
			  <TodoForm 
				todo={selectedTodo} 
				on:refresh={() => {
				  handleRefresh();
				  showForm = false;
				}}
				on:cancel={() => showForm = false}
			  />
			</div>
		  {:else if selectedTodo}
			<div class="center-content">
			  <TodoDetails 
				todo={selectedTodo} 
				on:edit={handleEdit}
				on:refresh={handleRefresh}   
			  />
			</div>
		  {:else}
			<div class="welcome">
			  <i class="far fa-clipboard"></i>
			  <h2>Welcome !!!</h2>
			  <p>Select a todo to view details or create a new one</p>
			</div>
		  {/if}
		</section>
	  </div>
	</div>
  </main>
  
  <style>
	main {
	  min-height: 100vh;
	  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	}
  
	.app-wrapper {
	  height: 100vh;
	  display: flex;
	  flex-direction: column;
	}
  
	header {
	  background: white;
	  padding: 1rem 2rem;
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}
  
	h1 {
	  margin: 0;
	  color: #2c3e50;
	  font-size: 1.8rem;
	}
  
	.content {
	  display: flex;
	  flex: 1;
	  overflow: hidden;
	}
  
	aside {
	  width: 350px;
	  background: white;
	  border-right: 1px solid #eee;
	  overflow-y: auto;
	}
  
	.main-section {
	  flex: 1;
	  background: #f8fafc;
	  overflow-y: auto;
	  display: flex;
	  justify-content: center;
	  align-items: flex-start;
	  padding: 2rem;
	}
  
	.center-content {
	  width: 100%;
	  max-width: 600px;
	  background: white;
	  border-radius: 12px;
	  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
  
	.add-btn {
	  background: #4CAF50;
	  color: white;
	  border: none;
	  border-radius: 8px;
	  padding: 0.75rem 1.5rem;
	  font-size: 1rem;
	  display: flex;
	  align-items: center;
	  gap: 0.5rem;
	  cursor: pointer;
	  transition: all 0.3s ease;
	}
  
	.add-btn:hover {
	  background: #43a047;
	}
  
	.welcome {
	  text-align: center;
	  color: #64748b;
	  padding: 2rem;
	}
  
	.welcome i {
	  font-size: 4rem;
	  color: #4CAF50;
	  margin-bottom: 1rem;
	}
  
	.welcome h2 {
	  color: #1e293b;
	  margin: 1rem 0;
	}
  
	@media (max-width: 768px) {
	  aside {
		width: 100%;
		border-right: none;
	  }
  
	  .content {
		flex-direction: column;
	  }
  
	  .main-section {
		padding: 1rem;
	  }
	}
  </style>
  