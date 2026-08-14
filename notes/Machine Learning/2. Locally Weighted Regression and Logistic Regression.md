## 1. Locally Weighted Regression

Locally weighted regression is an approach to modify linear regression so that it can fit non-linear functions.

### 1.1 Parametric and Non-parametric Learning Algorithms

- **Parametric learning algorithm**: Has a fixed set of parameters $\theta_0,\dots,\theta_n$ to learn.
- **Non-parametric learning algorithm**: The amount of data/parameters grows linearly with the size of training data.

Locally weighted regression belongs to non-parametric algorithms. We refit parameters for every prediction point, rather than learning a fixed global set of parameters once.

### 1.2 Core Idea

To evaluate $h(x)$ at a target point $x$:
Fit a straight line using only data points close to $x$ on the horizontal axis. We assign higher weights to samples nearby.

### 1.3 Weighted Cost Function

Fit parameter vector $\theta$ to minimize:
$$
\sum_{i=1}^m w^{(i)}\big(y^{(i)} - \theta^\mathrm{T}{x}^{(i)}\big)^2
$$
Where $w^{(i)}$ denotes the weight function.

Default Gaussian weight function:
$$
w^{(i)}=\exp\left(-\frac{\big(x^{(i)}-x\big)^2}{2\tau^2}\right)
$$

- $x$: the location where we want to make prediction
- $\tau$: bandwidth parameter, controls effective range of weights, affects overfitting / underfitting.

Property:
If $|x^{(i)}-x|$ is small, $w^{(i)}\approx1$;
If $|x^{(i)}-x|$ is large, $w^{(i)}\approx0$.

## 2. Probabilistic Interpretation of Linear Regression

### 2.1 Assumptions

Assume:
$$
y^{(i)}={\theta}^\mathrm{T}{x}^{(i)}+\varepsilon^{(i)}
$$
$\varepsilon^{(i)}$: random noise / unmodeled effects.

We further assume:
$$
\varepsilon^{(i)} \sim \mathcal{N}(0,\sigma^2)
$$
Probability density of noise:
$$
p(\varepsilon^{(i)})=\frac{1}{\sqrt{2\pi}\sigma}\exp\left(-\frac{(\varepsilon^{(i)})^2}{2\sigma^2}\right)
$$
Assume all $\varepsilon^{(i)}$ are independent and identically distributed (i.i.d.).

Equivalently:
$$
y^{(i)}\mid {x}^{(i)};{\theta} \sim \mathcal{N}\big({\theta}^\mathrm{T}{x}^{(i)},\sigma^2\big)
$$

### 2.2 Likelihood Function

Likelihood of parameter ${\theta}$:
$$
L({\theta})=p(\vec{y}\mid X;{\theta})=\prod_{i=1}^m p\big(y^{(i)}\mid {x}^{(i)};{\theta}\big)
$$
$$
L({\theta})=\prod_{i=1}^m \frac{1}{\sqrt{2\pi}\sigma}\exp\left(-\frac{\big(y^{(i)}-{\theta}^\mathrm{T}{x}^{(i)}\big)^2}{2\sigma^2}\right)
$$

#### Likelihood and Probability

- **Probability**: Treat ${\theta}$ as fixed constant, function of data.
- **Likelihood**: Treat training data as fixed, function of parameter ${\theta}$.

### 2.3 Log-Likelihood

$$
\ell({\theta})=\log L({\theta})
$$

### 2.4 Maximum Likelihood Estimation (MLE)

Choose ${\theta}$ to maximize $\ell({\theta})$.
This is equivalent to minimizing:
$$
\frac12\sum_{i=1}^m\big(y^{(i)}-{\theta}^\mathrm{T}{x}^{(i)}\big)^2 = J({\theta})
$$
This explains why we adopt squared error cost function in linear regression.

## 3. Classification Problem and Logistic Regression

Binary classification: target variable $y\in\{0,1\}$.
Linear regression is unsuitable for classification tasks.

### 3.1 Logistic Function

We require hypothesis output $h_\theta(x)\in[0,1]$ to represent probability.
$$
h_\theta({x})=g\big({\theta}^\mathrm{T}{x}\big),\quad
g(z)=\frac{1}{1+e^{-z}}
$$
$g(z)$ maps any real number into range $(0,1)$.

### 3.2 Probability Assumption

Assume:
$$
\begin{cases}
P(y=1\mid {x};{\theta})=h_\theta({x})\\
P(y=0\mid {x};{\theta})=1-h_\theta({x})
\end{cases}
$$
Compact form:
$$
P(y\mid {x};{\theta})=\big(h_\theta({x})\big)^y \big(1-h_\theta({x})\big)^{1-y}
$$

### 3.3 Likelihood & Log-Likelihood

$$
L({\theta})=p(\vec{y}\mid X;{\theta})=\prod_{i=1}^m \big(h_\theta({x}^{(i)})\big)^{y^{(i)}} \big(1-h_\theta({x}^{(i)})\big)^{1-y^{(i)}}
$$
Log-likelihood:
$$
\ell({\theta})=\sum_{i=1}^m \Big[y^{(i)}\log h_\theta({x}^{(i)})+\big(1-y^{(i)}\big)\log\big(1-h_\theta({x}^{(i)})\big)\Big]
$$
Our goal: choose ${\theta}$ to maximize $\ell({\theta})$.

### 3.4 Batch Gradient Ascent

Update rule for gradient ascent (maximization):
$$
\theta_j:=\theta_j+\alpha \frac{\partial}{\partial\theta_j}\ell({\theta})
$$
Final update formula:
$$
\theta_j:=\theta_j+\alpha\sum_{i=1}^m \big(y^{(i)}-h_\theta({x}^{(i)})\big)x_j^{(i)}
$$
> Note: Although the update expression has identical form to linear regression gradient descent, $h_\theta({x})$ is defined differently.

## 4. Newton's Method

Gradient ascent takes small incremental steps and requires many iterations.
Newton's method makes larger jumps and converges in fewer iterations.

### 4.1 One-dimensional Case

Goal: Find $\theta$ such that $f(\theta)=0$.
When maximizing $\ell({\theta})$, we solve $\ell'(\theta)=0$.

Iteration rule:
$$
\theta^{(t+1)}=\theta^{(t)}-\frac{f(\theta^{(t)})}{f'(\theta^{(t)})}
$$

### 4.2 Vector-valued Generalization

For vector parameter ${\theta}\in\mathbb{R}^{n+1}$:
$$
{\theta}^{(t+1)}={\theta}^{(t)}-{H}^{-1}\nabla\ell
$$

- $\nabla\ell$: gradient vector of log-likelihood
- ${H}$: Hessian matrix, $H_{ij}=\dfrac{\partial^2 \ell}{\partial\theta_i\partial\theta_j}$

### 4.3 Quadratic Convergence

Newton's method enjoys quadratic convergence.
When the current estimate is close to optimal value, the error shrinks extremely rapidly in each iteration.

Trade-off: Each iteration requires computing and inverting the Hessian matrix, which carries heavy computational cost.