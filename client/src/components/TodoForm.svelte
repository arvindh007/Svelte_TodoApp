<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let todo = null; // If provided, we're editing an existing todo
  
  let title = todo ? todo.title : '';
  let description = todo ? todo.description : '';
  let loading = false;
  let error = null;

  const API_URL = 'http://localhost:5000';

  async function handleSubmit() {
    try {
      loading = true;
      error = null;

      const url = todo 
        ? `${API_URL}/todos/${todo.id}`
        : `${API_URL}/todos`;
      
      const method = todo ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description })
      });

      if (!response.ok) throw new Error('Failed to save todo');

      const savedTodo = await response.json();
      dispatch('save', savedTodo);
      dispatch('refresh');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="todo-form">
  <h2>{todo ? 'Edit Todo' : 'Create New Todo'}</h2>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
  
  <div class="form-group">
    <label for="title">Title</label>
    <input
      id="title"
      type="text"
      bind:value={title}
      placeholder="Enter todo title"
      required
    />
  </div>
  
  <div class="form-group">
    <label for="description">Description</label>
    <textarea
      id="description"
      bind:value={description}
      placeholder="Enter todo description"
      rows="4"
    ></textarea>
  </div>
  
  <div class="form-actions">
    <button type="button" on:click={() => dispatch('cancel')}>
      Cancel
    </button>
    <button type="submit" disabled={loading}>
      {loading ? 'Saving...' : (todo ? 'Update' : 'Create')}
    </button>
  </div>
</form>

<style>
  .todo-form {
    max-width: 500px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .form-group {
    margin-bottom: 15px;
  }

  label {
    display: block;
    margin-bottom: 5px;
    color: #333;
  }

  input, textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button[type="submit"] {
    background-color: #4CAF50;
    color: white;
  }

  button[type="button"] {
    background-color: #f5f5f5;
    color: #333;
  }

  .error {
    color: #f44336;
    margin-bottom: 15px;
    padding: 10px;
    background-color: #ffebee;
    border-radius: 4px;
  }
</style>
