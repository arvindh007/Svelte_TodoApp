<!-- TodoForm.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let todo = null;
  
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
      dispatch('refresh');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function handleComplete(todoId) {
    try {
      loading = true;
      error = null;
      
      const response = await fetch(`${API_URL}/todos/${todoId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: true })
      });

      if (!response.ok) throw new Error('Failed to complete todo');

      dispatch('refresh');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<!-- TodoForm.svelte -->
<div class="form-container">
  <h2>{todo ? 'Edit Task' : 'Create New Task'}</h2>

  <form on:submit|preventDefault={handleSubmit}>
    {#if error}
      <div class="error">
        <i class="fas fa-exclamation-circle"></i>
        {error}
      </div>
    {/if}
    
    <div class="form-group">
      <label for="title">Title</label>
      <input
        id="title"
        type="text"
        bind:value={title}
        placeholder="Enter task title"
        required
      />
    </div>
    
    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        bind:value={description}
        placeholder="Enter task description"
        rows="4"
      ></textarea>
    </div>
    
    <div class="form-actions">
      <button type="button" class="cancel-btn" on:click={() => dispatch('cancel')}>
        Cancel
      </button>
      <button type="submit" class="submit-btn" disabled={loading}>
        {#if loading}
          <i class="fas fa-spinner fa-spin"></i>
        {:else}
          <i class="fas fa-save"></i>
        {/if}
        {loading ? 'Saving...' : (todo ? 'Update' : 'Create')}
      </button>
    </div>
  </form>
</div>

<style>
  .form-container {
    padding: 2rem;
  }

  h2 {
    margin: 0 0 1.5rem 0;
    color: #1e293b;
    font-size: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #4b5563;
    font-weight: 500;
  }

  input, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }

  .cancel-btn, .submit-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .cancel-btn {
    background: #f1f5f9;
    border: none;
    color: #64748b;
  }

  .submit-btn {
    background: #4CAF50;
    border: none;
    color: white;
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .error {
    background: #fef2f2;
    color: #ef4444;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
