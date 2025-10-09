import os
from matplotlib import pyplot as plt
from matplotlib.lines import Line2D
import numpy as np

styleDict = {
    "eval_color": "red",
    "test_color": "blue",
    "valid": "-",
    "exact": "--",
    "exec": ":",
}


def _create_legend_handles():
    color_handles = [
        Line2D([0], [0], color=styleDict["eval_color"], lw=2, label="Evaluation"),
        Line2D([0], [0], color=styleDict["test_color"], lw=2, label="Test"),
    ]

    style_handles = [
        Line2D(
            [0],
            [0],
            color="black",
            linestyle=styleDict["valid"],
            lw=2,
            label="Prediction Valid",
        ),
        Line2D(
            [0],
            [0],
            color="black",
            linestyle=styleDict["exact"],
            lw=2,
            label="Exact Match",
        ),
        Line2D(
            [0],
            [0],
            color="black",
            linestyle=styleDict["exec"],
            lw=2,
            label="Execution Match",
        ),
    ]
    return color_handles + style_handles


def plot_epoch_results(eval_results, test_results, save_path):
    eval_predication_valid = []
    eval_exact_match = []
    eval_exec_match = []
    x_values = []
    for stage_idx, (results) in enumerate(eval_results):
        for epoch in results.keys():
            x_values.append(stage_idx + ((epoch - 2) / 10))
            eval_predication_valid.append(results[epoch]["prediction_valid"])
            eval_exact_match.append(results[epoch]["exact_match"])
            eval_exec_match.append(results[epoch]["exec_match"])

    testing_predication_valid = [
        result[0]["prediction_valid"] for result in test_results
    ]
    testing_exact_match = [result[0]["exact_match"] for result in test_results]
    testing_exec_match = [result[0]["exec_match"] for result in test_results]
    testing_x_values = np.arange(len(test_results))

    plt.plot(
        x_values,
        eval_predication_valid,
        color=styleDict["eval_color"],
        linestyle=styleDict["valid"],
    )
    plt.plot(
        x_values,
        eval_exact_match,
        color=styleDict["eval_color"],
        linestyle=styleDict["exact"],
    )
    plt.plot(
        x_values,
        eval_exec_match,
        color=styleDict["eval_color"],
        linestyle=styleDict["exec"],
    )

    plt.plot(
        testing_x_values,
        testing_predication_valid,
        color=styleDict["test_color"],
        linestyle=styleDict["valid"],
    )
    plt.plot(
        testing_x_values,
        testing_exact_match,
        color=styleDict["test_color"],
        linestyle=styleDict["exact"],
    )
    plt.plot(
        testing_x_values,
        testing_exec_match,
        color=styleDict["test_color"],
        linestyle=styleDict["exec"],
    )

    handles = _create_legend_handles()

    plt.legend(
        handles=handles,
        title="Metrics & Datasets",
        loc="upper center",
        bbox_to_anchor=(0.5, -0.15),
        ncol=3,
        frameon=True,
        shadow=True,
        fontsize=10,
        title_fontsize=11,
    )

    plt.title("Model Metrics per Stage")
    plt.xlabel("Learning Stage")
    plt.ylabel("Score")
    plt.grid(True)
    filepath = os.path.join(save_path, "metric_results.png")
    print(f"file saved to: {filepath}")
    plt.savefig(filepath, dpi=300, bbox_inches="tight")
    plt.close()
