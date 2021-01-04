from importlib import import_module

from setuptools import find_packages, setup

setup(
    name="datalayer-rtc",
    version=import_module("datalayer_rtc").__version__,
    description=(
        "Real Time Collaboration."
    ),
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/datalayer-experiments/rtc",
    license="MIT",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: Implementation :: CPython",
        "Programming Language :: Python :: Implementation :: PyPy",
    ],
    keywords="Datalayer RTC",
    python_requires=">=3.6",
    install_requires=[
        "jupyter_server",
#        "jupyter_server_proxy",
    ],
    extras_require={
        "sphinx": [],
        "code_style": [
            "flake8<3.8.0,>=3.7.0", 
            "black", 
            "pre-commit==1.17.0"
        ],
        "testing": [
            "coverage",
            "pytest>=3.6,<4",
            "pytest-cov",
            "pytest-regressions"
        ],
        # Note: This is only required for internal use
        "rtd": [
            "myst_nb",
            "pyyaml",
            "docutils>=0.15",
            "sphinx",
            "sphinxcontrib-bibtex",
            "sphinxcontrib-mermaid",
            "ipython",
            "sphinx-book-theme",
            "sphinx_tabs"
        ],
    },
    zip_safe=True,
)
