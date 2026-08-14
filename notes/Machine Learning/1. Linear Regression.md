## 1. Basic Concepts

### 1.1 Problem Category & Learning Pipeline

Supervised Learning $\rightarrow$ Regression Problem $\rightarrow$ **Linear Regression**

Learning process:
$$\text{training sets} \xrightarrow{\text{learning algorithm}} \text{hypothesis function } h({x})$$

### 1.2 Hypothesis Function

Univariate form:
$$h(x)=\theta_0+\theta_1 x$$

Multivariate form, define $x_0=1$:
$$h_\theta({x})=\sum_{j=0}^n \theta_j x_j$$

Vector form:
$$
{\theta}=
\begin{bmatrix}
\theta_0\\
\theta_1\\
\theta_2
\end{bmatrix},\quad
{x}=
\begin{bmatrix}
x_0\\
x_1\\
x_2
\end{bmatrix},\quad
h_\theta({x})={\theta}^\mathrm{T}{x}
$$
${\theta}$: model parameters

### 1.3 Notations

- $m$: number of training examples (rows in dataset)
- $n$: number of input features
- $x$: input features
- $y$: output target variable
- $(x,y)$: one training example
- $({x}^{(i)},y^{(i)})$: the $i$-th training example, $i=1,2,\dots,m$

Goal: Choose parameters ${\theta}$ such that $h_\theta({x}^{(i)})\approx y^{(i)}$ for training data.

## 2. Cost Function: Ordinary Least Squares

Linear regression adopts **Ordinary Least Square**
$$
J({\theta})=\frac{1}{2}\sum_{i=1}^m \big(h_\theta({x}^{(i)})-y^{(i)}\big)^2
$$
Optimization target:
$$\min_{{\theta}} J({\theta})$$

Property: $J({\theta})$ is a convex function. There is no local optimum other than the global optimum.

## 3. Gradient Descent

### 3.1 Core Idea

1. Initialize ${\theta}$ randomly (e.g. ${\theta}={0}$)
2. Iteratively update parameters to reduce $J({\theta})$

Update rule:
$$
\theta_j:=\theta_j-\alpha \frac{\partial}{\partial \theta_j}J({\theta}),\quad j=0,1,\dots,n
$$

- $\alpha$: learning rate, if the learning rate is too large, then you might go past the optimal point and $J({\theta})$ will increase.
- Partial derivative: defines the steepest descending direction of cost function

### 3.2 Derivation

$$
\begin{aligned}
\frac{\partial}{\partial\theta_j}J({\theta})
&=\frac{\partial}{\partial\theta_j}\left[\frac12\big(h_\theta({x})-y\big)^2\right]\\
&=\big(h_\theta({x})-y\big)\cdot\frac{\partial}{\partial\theta_j}h_\theta({x})\\
&=x_j\cdot\big(h_\theta({x})-y\big)
\end{aligned}
$$

### 3.3 Batch Gradient Descent

$$
\theta_j:=\theta_j-\alpha\sum_{i=1}^m x_j^{(i)}\big(h_\theta({x}^{(i)})-y^{(i)}\big)
$$
Batch means every parameter update requires traversing all $m$ training samples.

### 3.4 Stochastic Gradient Descent

Update parameters sample by sample, without using the whole dataset in one iteration:
$$
\begin{aligned}
&\text{Repeat } \{ \\
&\quad \text{for } i = 1 \text{ to } m \{ \\
&\qquad \theta_j := \theta_j - \alpha x_j^{(i)} \big(h_\theta(x^{(i)}) - y^{(i)}\big) \\
&\quad \} \\
&\}
\end{aligned}
$$


## 4. Normal Equation (Analytical Solution)

Gradient descent is an iterative numerical method. The normal equation computes the optimal parameter directly with closed-form solution.

### 4.1 Matrix Gradient & Trace

Let $f(A)$ be a function mapping matrix to real scalar. Matrix gradient definition:
$$
\nabla_A f(A)=
\begin{bmatrix}
\frac{\partial f}{\partial A_{11}} & \dots & \frac{\partial f}{\partial A_{1n}}\\
\vdots & \ddots & \vdots\\
\frac{\partial f}{\partial A_{n1}} & \dots & \frac{\partial f}{\partial A_{nn}}
\end{bmatrix}
$$

Trace of square matrix:
$$\mathrm{tr}(A)=\sum_i A_{ii}$$

Properties of trace:

- $\mathrm{tr}(A)=\mathrm{tr}(A^\mathrm{T})$
- $\mathrm{tr}(AB)=\mathrm{tr}(BA)$
- $\mathrm{tr}(ABC)=\mathrm{tr}(BCA)$

Properties of matix gradient:

- $\nabla_{\theta}\big({\theta}^\mathrm{T}{b}\big)={b}$
- $\nabla_{\theta}\big({\theta}^\mathrm{T}A{\theta}\big)=(A+A^\mathrm{T}){\theta}$

### 4.2 Matrix Form of Cost Function

Design matrix ${X}\in\mathbb{R}^{m\times(n+1)}$, label vector ${y}\in\mathbb{R}^m$:
$$
{X}=
\begin{bmatrix}
({x}^{(1)})^\mathrm{T}\\
({x}^{(2)})^\mathrm{T}\\
\vdots\\
({x}^{(m)})^\mathrm{T}
\end{bmatrix},\quad
{y}=
\begin{bmatrix}
y^{(1)}\\
y^{(2)}\\
\vdots\\
y^{(m)}
\end{bmatrix}
$$

Cost function:
$$
J({\theta})=\frac12({X}{\theta}-{y})^\mathrm{T}({X}{\theta}-{y})
$$

### 4.3 Derivation of Normal Equation

Optimality condition: gradient equals zero vector $\nabla_{\theta}J({\theta})={0}$
$$
\begin{aligned}
\nabla_{\theta}J({\theta})
&=\frac12\nabla_{\theta}\big(({X}{\theta}-{y})^\mathrm{T}({X}{\theta}-{y})\big)\\
&={X}^\mathrm{T}{X}{\theta}-{X}^\mathrm{T}{y}={0}
\end{aligned}
$$

Normal equation:
$${X}^\mathrm{T}{X}{\theta}={X}^\mathrm{T}{y}$$

Closed-form solution for optimal parameters:
$${\theta}=({X}^\mathrm{T}{X})^{-1}{X}^\mathrm{T}{y}$$
