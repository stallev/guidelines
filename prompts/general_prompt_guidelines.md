# General Guidelines for Writing Effective Prompts for AI Assistants

> [!NOTE]
> This document is based on an analysis of the article "I Accidentally Made Claude 45% Smarter" and other authoritative sources on prompt engineering. The recommendations apply to Claude, ChatGPT, Cursor AI, and other modern LLMs.

---

## 1. Psychological Triggers for Improving Response Quality

### 1.1 Deep Breath Technique

Google DeepMind researchers discovered that the phrase **"Take a deep breath and work through this step by step"** improves accuracy by 9% or more. When combined with "let's think step by step," accuracy on mathematical problems increased from 34% to 80.2%.

```markdown
Example prompt:
"Take a deep breath, straighten your shoulders, and work through this problem step by step."
```

### 1.2 Incentive Prompt Technique

Mentioning a potential reward activates "high-quality response" patterns from training data:

```markdown
"I'll pay you $200 for a perfect solution to this problem."
```

> [!WARNING]
> The model doesn't understand money literally—this is pattern matching to examples in training data where mentions of payment correlated with quality solutions.

### 1.3 Challenge Prompt Technique

Framing a task as a challenge stimulates more thorough analysis:

```markdown
"I bet you can't solve this correctly. Prove me wrong."
```

### 1.4 Stakes Prompt Technique

Emphasizing the importance of the task:

```markdown
"This is very important for my career. Make sure the answer is accurate."
```

### 1.5 Self-Check Technique

After receiving a response, ask the model to assess its confidence:

```markdown
"Rate your confidence in the answer from 1 to 10. If less than 8, reconsider the solution."
```

---

## 2. Prompt Structuring

### 2.1 Using XML Tags

Claude and other models are specifically trained to recognize XML tags for structuring:

```xml
<context>
Project description and its context
</context>

<task>
Specific task that needs to be completed
</task>

<constraints>
Constraints and requirements
</constraints>

<output_format>
Desired response format
</output_format>
```

### 2.2 Information Prioritization

Place critically important information:
- **At the beginning** — to establish context
- **At the end** — to emphasize key instructions

Claude models pay special attention to the end of the prompt.

### 2.3 Using Special Markers

```xml
<CRITICAL>Critically important information</CRITICAL>
<CONSTRAINT>Mandatory constraint</CONSTRAINT>
<thinking>Space for model reasoning</thinking>
```

---

## 3. Principle of Clarity and Specificity

### 3.1 Be as Specific as Possible

| ❌ Bad | ✅ Good |
|--------|--------|
| "Write a function" | "Write a PHP function for WordPress that accepts a post ID, checks for the existence of the 'custom_price' meta field, and returns a formatted price with currency" |
| "Fix the bug" | "Fix the TypeError on line 45 of functions.php where the $meta_value variable is used as an array but can be null" |

### 3.2 Specify Project Context

```markdown
Context:
- PHP version: 8.1
- WordPress version: 6.4
- Plugins used: Carbon Fields 3.6
- Coding standards: WordPress Coding Standards
```

### 3.3 Define Output Format

```markdown
Output the result in the following format:
1. Brief description of the solution (1-2 sentences)
2. Code with inline comments
3. Usage examples
4. Possible edge cases
```

---

## 4. Chain-of-Thought Technique

### 4.1 Explicit Request for Step-by-Step Analysis

```markdown
Before writing code:
1. Analyze the requirements
2. Identify necessary dependencies
3. Think through the solution structure
4. Assess potential issues
5. Only then proceed with implementation
```

### 4.2 Providing Space for Reasoning

```xml
<thinking>
Use this block to analyze the task before responding
</thinking>

<answer>
Provide the final answer here
</answer>
```

---

## 5. Few-Shot Prompting

### 5.1 Provide Reference Examples

```markdown
Here's an example of a correct solution to a similar task:

Input: [example input data]
Output: [example expected result]

Now solve the following task similarly:
Input: [new input data]
```

### 5.2 Use "Golden Standards"

Reference exemplary files in the project:

```markdown
Use the structure and code style from the file 
controllers/ExampleController.php as a template.
```

---

## 6. Persona Assignment

### 6.1 Specific Expert Roles

| ❌ Generic Role | ✅ Detailed Role |
|-----------------|------------------|
| "You are a programmer" | "You are a senior PHP developer with 10 years of experience developing WordPress themes and plugins, specializing in security and performance" |

### 6.2 Combining Expertise

```markdown
Act as a team of experts:
1. Backend Developer — responsible for PHP logic
2. Security Specialist — checks for vulnerabilities
3. WordPress Expert — ensures compliance with standards
```

---

## 7. Iterative Refinement

### 7.1 Dialog Approach

```markdown
Step 1: "Describe the solution architecture without code"
Step 2: "Now implement the main function"
Step 3: "Add error handling"
Step 4: "Optimize performance"
```

### 7.2 Correction Based on Errors

If the model made an error:

```markdown
In your previous response, you used the deprecated 
method add_meta_box(). In WordPress 6.0+, you should 
use register_post_meta() with REST API support.
Fix the code accordingly.
```

---

## 8. Positive Formulations

### 8.1 "Do" Instructions Instead of "Don't"

| ❌ Negative | ✅ Positive |
|-------------|-------------|
| "Don't use global variables" | "Use only local variables within the function scope" |
| "Don't forget validation" | "Add validation for all input data" |

---

## 9. Decomposition of Complex Tasks

### 9.1 Break Down Large Tasks

Instead of:
```markdown
"Create a full WordPress theme with custom fields and REST API"
```

Use:
```markdown
"Task 1: Create the theme file structure with style.css and functions.php"
"Task 2: Set up Carbon Fields integration"  
"Task 3: Define field containers for the About page"
...
```

### 9.2 Prompt Chaining

Use the result of the previous prompt as input for the next:

```markdown
Prompt 1: "Analyze the data structure"
Prompt 2: "Based on the analysis, create a database schema"
Prompt 3: "Based on the schema, write migrations"
```

---

## 10. Prefilling

### 10.1 Guide the Beginning of the Response

```markdown
Start your answer with: "The optimal solution includes..."
```

This helps avoid introductory phrases and get straight to the point.

### 10.2 Specify Code Format

```markdown
Respond with PHP code only, without additional explanations.
The code should start with:
<?php
/**
 * @package MyTheme
```

---

## 11. Avoiding Common Mistakes

### 11.1 Common Anti-Patterns

- **Vague goals** → Formulate a clear desired outcome
- **Lack of context** → Always provide relevant background
- **Information overload** → Keep the prompt focused
- **Mixing modes** → Don't mix writing, review, and training in one prompt
- **Repeating instructions** → Avoid duplication

### 11.2 Prompt Checklist

Before sending, ensure the prompt answers these questions:
1. **What** specifically needs to be done?
2. **Why** is this needed (context)?
3. **How** should the result look?
4. **What** constraints exist?

---

## 12. Meta-Prompting

### 12.1 Ask AI to Improve the Prompt

```markdown
Analyze the following prompt and improve it:
- Remove redundancy
- Add necessary structure
- Increase clarity

Original prompt: [your prompt]
```

### 12.2 Request Alternative Approaches

```markdown
Suggest 3 different approaches to solving the task with 
an indication of the pros and cons of each.
```

---

## 13. Universal Prompt Template

```markdown
# Role
You are [specific expert role]

# Context
- Project: [description]
- Technologies: [stack]
- Constraints: [list]

# Task
[Specific description of what needs to be done]

# Requirements
1. [Requirement 1]
2. [Requirement 2]
...

# Output Format
[Description of desired response structure]

# Examples (optional)
Input: [example]
Output: [example]

# Additional Instructions
- Take a deep breath and work step by step
- This is a very important task for the project
```

---

## 14. Cursor AI Specifics

### 14.1 Cursor Rules

Create rule files in `.cursor/rules/`:

```markdown
# Example .cursor/rules/wordpress.mdc

## General WordPress Rules
- Use WordPress Coding Standards
- Apply escape functions for output: esc_html(), esc_attr()
- Use nonce for forms
- Add inline comments in PHPDoc format
```

### 14.2 Using Context

- `@Files` — reference specific files
- `@Folders` — reference directories
- `@Codebase` — entire project
- `@Docs` — documentation
- `@Web` — internet search

### 14.3 Creating Notepads

Save frequently used prompts as Notepads for quick access.

---

## Conclusion

> [!TIP]
> Effective prompt engineering is a skill that develops with practice. Start with basic techniques and gradually add more complex ones.

Key principles:
1. **Clarity** — formulate clearly and specifically
2. **Context** — provide relevant information
3. **Structure** — use markup and tags
4. **Examples** — show the desired result
5. **Iteration** — refine and improve prompts

---

## Sources

- "I Accidentally Made Claude 45% Smarter" — Medium (@ichigoSan)
- Anthropic Claude Documentation
- OpenAI Prompt Engineering Guide
- Google DeepMind Research on Prompt Optimization
- Cursor AI Official Documentation
