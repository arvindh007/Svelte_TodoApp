<script>
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();

  export let selectedTodoId = null;
  let todos = [];
  let filter = 'all';
  let loading = true;
  let error = null;
  // let updateInputs = {};

  const API_URL = 'http://localhost:5000';

  async function fetchTodos() {
    try {
      loading = true;
      error = null;
      const response = await fetch(`${API_URL}/todos`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      todos = await response.json();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function deleteTodo(event, id) {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this todo?')) return;
    
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete todo');
      
      todos = todos.filter(todo => todo.id !== id);
      if (selectedTodoId === id) {
        dispatch('selectTodo', null);
      }
    } catch (err) {
      error = err.message;
    }
  }

  // async function toggleTodo(id) {
  //   try {
  //     const response = await fetch(`${API_URL}/todos/${id}/toggle`, {
  //       method: 'PATCH',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });
      
  //     if (!response.ok) throw new Error('Failed to toggle todo');
      
  //     const updatedTodo = await response.json();
  //     todos = todos.map(todo => 
  //       todo.id === updatedTodo.id ? updatedTodo : todo
  //     );
  //   } catch (err) {
  //     error = err.message;
  //   }
  // }

  // async function addUpdate(event, todoId) {
  //   event.preventDefault();
  //   const updateText = updateInputs[todoId] || '';
  //   if (!updateText.trim()) return;

  //   try {
  //     const response = await fetch(`${API_URL}/todos/${todoId}/updates`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({ update: updateText })
  //     });

  //     if (!response.ok) throw new Error('Failed to add update');

  //     const updatedTodo = await response.json();
  //     todos = todos.map(todo => 
  //       todo.id === updatedTodo.id ? updatedTodo : todo
  //     );
  //     updateInputs[todoId] = ''; // Clear only this todo's input
  //     updateInputs = {...updateInputs}; // Trigger reactivity
  //   } catch (err) {
  //     error = err.message;
  //   }
  // }

  

  // function handleUpdateInput(todoId, value) {
  //   updateInputs[todoId] = value;
  //   updateInputs = {...updateInputs}; // Trigger reactivity
  // }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  $: filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  onMount(fetchTodos);
</script>

<div class="filters">
  <!-- <button class:active={filter === 'all'} on:click={() => filter = 'all'}>
    All
  </button>
  <button class:active={filter === 'active'} on:click={() => filter = 'active'}>
    Active
  </button> -->
  <!-- <button class:active={filter === 'completed'} on:click={() => filter = 'completed'}>
    Completed
  </button> -->
</div>

<div class="todo-list">
  {#if loading}
    <div class="loading">Loading todos...</div>
  {:else if error}
    <div class="error">
      Error: {error}
      <button on:click={fetchTodos}>Try again</button>
    </div>
  {:else if todos.length === 0}
    <div class="empty">No todos yet</div>
  {:else}
    {#each filteredTodos as todo (todo.id)}
    <!-- {let updateValue = updateInputs[todo.id] || ''} -->
      <div 
        class="todo-item {selectedTodoId === todo.id ? 'selected' : ''}"
        on:click={() => dispatch('selectTodo', todo)}
        on:keydown={(e) => e.key === 'Enter' && dispatch('selectTodo', todo)}
        role="button"
        tabindex="0"
      >
        <div class="todo-content">
          <div class="todo-header">
            <!-- <input
              type="checkbox"
              checked={todo.completed}
              on:change={() => toggleTodo(todo.id)}
              on:click|stopPropagation
            /> -->
            <div class="todo-title-section">
              <h3 class="todo-title {todo.completed ? 'completed' : ''}">{todo.title}</h3>
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- <form 
                on:submit={(e) => addUpdate(e, todo.id)} 
                class="update-form"
                on:click|stopPropagation
              >
                <input
                  type="text"
                  placeholder="Add an update..."
                  value={updateInputs[todo.id] || ''}
                  class="update-input"
                />
                <button type="submit" class="update-button">Add</button>
              </form> -->
            </div>
          </div>

          <!-- {#if todo.updates && todo.updates.length > 0}
            <div class="updates-list">
              {#each todo.updates as update}
                <div class="update-entry">
                  <span class="update-text">{update.text}</span>
                  <span class="update-date">{formatDate(update.date)}</span>
                </div>
              {/each}
            </div>
          {/if} -->

          {#if todo.created_at}
            <div class="todo-date">
              <i class="far fa-clock"></i> 
              Created: {formatDate(todo.created_at)}
            </div>
          {/if}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .todo-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .todo-item {
    display: flex;
    align-items: flex-start;
    padding: 15px;
    border-radius: 8px;
    background-color: #f5f5f5;
    transition: all 0.2s ease;
    border: 1px solid #e0e0e0;
    gap: 15px;
    cursor: pointer;
  }

  .todo-item:hover {
    background-color: #e8e8e8;
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .todo-content {
    flex-grow: 1;
  }

  .todo-header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
  }

  .todo-title-section {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .todo-title {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
  }

  .completed {
    text-decoration: line-through;
    color: #888;
  }

  .todo-date {
    font-size: 0.85rem;
    color: #666;
    margin-top: 10px;
  }

  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .loading, .error, .empty {
    text-align: center;
    padding: 20px;
    color: #666;
  }

  .error {
    color: #f44336;
  }

  .error button {
    margin-top: 10px;
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
