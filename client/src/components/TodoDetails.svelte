<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let todo;

  function formatDate(dateString) {
    const options = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  async function deleteTodo() {
    if (confirm('Are you sure you want to delete this todo?')) {
      try {
        const response = await fetch(`http://localhost:5000/todos/${todo.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete todo');
        }

        dispatch('refresh');
      } catch (err) {
        alert('Failed to delete todo');
      }
    }
  }
</script>

<div class="todo-details">
  <div class="header">
    <h2>{todo.title}</h2>
    <div class="actions">
      <button class="edit" on:click={() => dispatch('edit')}>Edit</button>
      <button class="delete" on:click={deleteTodo}>Delete</button>
    </div>
  </div>
  <div class="meta-info">
    <span class="created-at">
      <i class="far fa-clock"></i> Created: {formatDate(todo.created_at)}
    </span>
  </div>
  <div class="description">
    <p>{todo.description}</p>
  </div>
</div>

<style>
  .todo-details {
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .header h2 {
    margin: 0;
    color: #333;
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  button:hover {
    opacity: 0.9;
  }

  .edit {
    background-color: #2196F3;
    color: white;
  }

  .delete {
    background-color: #f44336;
    color: white;
  }

  .meta-info {
    margin-bottom: 20px;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
  }

  .created-at {
    font-size: 0.9em;
    color: #666;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .description {
    line-height: 1.6;
    color: #444;
  }
</style>
