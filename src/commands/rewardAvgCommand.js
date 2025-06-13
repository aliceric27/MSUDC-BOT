import {
  InteractionResponseType,
  InteractionResponseFlags,
} from 'discord-interactions';
import { JsonResponse } from './index.js';

export async function handleRewardAvgCommand(interaction) {
  try {
    // 獲取用戶提供的參數
    const options = interaction.data.options || [];
    const peopleOption = options.find((opt) => opt.name === 'people');
    const totalRewardOption = options.find((opt) => opt.name === 'totalreward');
    const baseFeeOption = options.find((opt) => opt.name === 'basefee');
    const extraFeeOption = options.find((opt) => opt.name === 'extrafee');
    const swapRateOption = options.find((opt) => opt.name === 'swaprate');
    const detailOption = options.find((opt) => opt.name === 'detail');

    // 確保提供了必要參數
    if (!peopleOption || !totalRewardOption) {
      return new JsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '😥資料錯誤，請提供正確資訊!',
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }

    // 獲取參數值，並設置默認值
    const numPeople = peopleOption.value;
    const totalReward = totalRewardOption.value;
    const baseFee = baseFeeOption ? baseFeeOption.value : 0.001;
    const extraFee = extraFeeOption ? extraFeeOption.value : 0.025;
    const swapRate = swapRateOption ? swapRateOption.value : 100000;
    const showDetail = detailOption ? detailOption.value : false;

    // 計算每人分配的 NEPC 總額
    const totalRewardToNxpc = totalReward / swapRate;

    // 計算總共的 Fee
    const totalFee = (numPeople - 1) * (baseFee + extraFee);

    // 得到獎池總額
    const wrapTotal = totalRewardToNxpc - totalFee;

    // 每人分配的 Wrap 總額
    const wrapPerPerson = wrapTotal / numPeople;

    // 每分配NESO
    const wrapPerNeso = wrapPerPerson * swapRate;

    // 分隔線
    const divider = '____________________________________________';

    // 建立欄位數組
    let fields = [];
    
    if (showDetail) {
      // 詳細模式 - 顯示完整計算過程
      fields = [
        {
          name: '📊 __基本資訊__',
          value: `**${divider}**`,
        },
        {
          name: '👥 參與人數',
          value: `**${numPeople}** 人`,
          inline: true,
        },
        {
          name: '💱 兌換比率',
          value: `**1 NXPC** = ${swapRate} NESO`,
          inline: true,
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: true,
        },
        {
          name: '💵 __獎勵總額__',
          value: `**${divider}**`,
        },
        {
          name: '🪙 NESO 總額',
          value: `**${totalReward.toLocaleString('zh-TW')}** NESO`,
          inline: true,
        },
        {
          name: '💰 NXPC 總額',
          value: `**${totalRewardToNxpc.toFixed(6)}** NXPC`,
          inline: true,
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: true,
        },
        {
          name: '🧾 __手續費計算__',
          value: `**${divider}**`,
        },
        {
          name: '📝 基本手續費',
          value: `**${baseFee}** NXPC/筆`,
          inline: true,
        },
        {
          name: '📋 額外手續費',
          value: `**${extraFee}** NXPC/筆`,
          inline: true,
        },
        {
          name: '📑 總筆數',
          value: `**${numPeople - 1}** 筆`,
          inline: true,
        },
        {
          name: '💸 手續費總額',
          value: `**${totalFee.toFixed(6)}** NXPC`,
          inline: true,
        },
        {
          name: '🏦 扣除手續費後總額',
          value: `**${wrapTotal.toFixed(6)}** NXPC`,
          inline: true,
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: true,
        },
        {
          name: '📊 __每人分配結果__',
          value: `**${divider}**`,
        },
        {
          name: '💵 每人可得(NXPC)',
          value: `**${wrapPerPerson.toFixed(6)}** NXPC`,
          inline: true,
        },
        {
          name: '🪙 每人可得(NESO)',
          value: `**${wrapPerNeso.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}** NESO`,
          inline: true,
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: true,
        },
        {
          name: divider,
          value: '\u200B',
        },
      ];
    } else {
      // 簡化模式 - 只顯示基本資訊和結果
      fields = [
        {
          name: '📊 __基本資訊和結果__',
          value: `**${divider}**`,
        },
        {
          name: '👥 參與人數',
          value: `**${numPeople}** 人`,
          inline: true,
        },
        {
          name: '🪙 總獎勵',
          value: `**${totalReward.toLocaleString('zh-TW')}** NESO`,
          inline: true,
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: true,
        },
        {
          name: '💵 每人可得(NXPC)',
          value: `**${wrapPerPerson.toFixed(6)}** NXPC`,
          inline: true,
        },
        {
          name: '🪙 每人可得(NESO)',
          value: `**${wrapPerNeso.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}** NESO`,
          inline: true,
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: true,
        },
        {
          name: divider,
          value: '\u200B',
        },
      ];
    }

    // 建立 embed 回應
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          {
            color: 0x0099ff,
            title: '💰 BOSS 獎勵平均分配計算結果 💰',
            description: '```\n分配計算使用 Wrap 方式，手續費會浮動，請自行評估使用\n```',
            fields: fields,
            footer: {
              text: '計算公式：每人分配額度 = (總獎勵 - 總手續費) ÷ 參與人數',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });
  } catch (error) {
    console.error('處理獎勵平均分配計算時出錯:', error);
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '🚫 **錯誤** : 處理獎勵平均分配計算時出錯',
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
} 