"use client";
import React, { useState, useEffect } from 'react';
import Description from './Description'; // パスはプロジェクト構成に合わせて調整
import './page.css'; // スタイルシートのパス
import descriptionImage from './descriptionImage.png'; // パスはプロジェクト構成に合わせて調整
import Header from './Header'; // ヘッダーコンポーネントのインポート

type Ticket = {
    ticket_number: string;
    number_of_people: number;
    status: string;
};

const TicketQuePage: React.FC = () => {
    const [waitGroupCount, setWaitGroupCount] = useState<number>(0);
    const [currentGroupNumber, setCurrentGroupNumber] = useState<number>(0);
    // 表示する内容を管理するstate
    const [displayText, setDisplayText] = useState(waitGroupCount);
    const [showTitle, setShowTitle] = useState('待ち組数');
    const [showGroup, setShowGroup] = useState(true);
    const [loading, setLoading] = useState(true); // 追加
    const [inputNumber, setInputNumber] = useState<string>('');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await fetch('https://fastapi-on-vercel-pi.vercel.app/api/tickets');
                const data: Ticket[] = await res.json();

                // 入力された番号より’終了’を除いた若い数の合計
                // inputNumber は state で保持していると仮定
                const waitCount = data.filter(ticket => {
                    // status が "終了" のものは対象外
                    if (ticket.status === '終了') return false;

                    // 入力番号がある場合のみ絞り込み
                    if (inputNumber) {
                        return Number(ticket.ticket_number) < Number(inputNumber);
                    }

                    return false; // 入力番号がなければカウントしない
                }).length;
                console.log('Fetched tickets:', data);
                setWaitGroupCount(waitCount);

                // "呼び出し中"の最大番号
                const calledTickets = data
                    .filter(ticket => ticket.status === '呼び出し中')
                    .map(ticket => Number(ticket.ticket_number))
                    .filter(num => !isNaN(num));
                const maxCalled = calledTickets.length > 0 ? Math.max(...calledTickets) : 0;
                setCurrentGroupNumber(maxCalled);

                // 初期表示
                setDisplayText(waitCount);
            } catch (e) {
                // エラー時は0表示
                setWaitGroupCount(0);
                setCurrentGroupNumber(0);
                setDisplayText(0);
            } finally {
                setLoading(false); // 読み込み完了
            }
        };
        fetchTickets();
    }, [inputNumber]);

    if (loading) {
        return (
            <div className="loading-message">
                読み込み中...
            </div>
        );
    }
    return (
        <div>
            <div className="header">
                {/* <img src="/reload_icon.png" alt="Logo" className="logo" onClick={() => window.location.reload()}/> */}
            </div>
            <div className="title">脱出ゲーム</div>
            <div className="attraction-queue">
                {showGroup && (
                    <div  className="queue-container">
                        <div className="circle">
                            <h2 className="circle-title">{showTitle}</h2>
                            <p className="circle-number">{displayText}</p>
                        </div>
                        
                        
                        <div className="button-group">
                            <div className="button-row">
                                <input
                                    type="number"
                                    placeholder="番号を入力"
                                    value={inputNumber}
                                    onChange={(e) => setInputNumber(e.target.value)}
                                    className="number-input"
                                />
                            </div>
                            <div className="button-row">
                                <button onClick={() => {
                                    setShowTitle('待ち組数');
                                    setDisplayText(waitGroupCount);
                                }}>待ち組数</button>

                                <button onClick={() => {
                                    setShowTitle('お呼び出し番号');
                                    setDisplayText(currentGroupNumber);
                                }}>お呼び出し番号</button>
                            </div>
                            <div className="button-row">
                                <button className="full-width-button" onClick={() => setShowGroup(!showGroup)}>企画説明</button>
                            </div>
                        </div>
                    </div>
                )}
                {!showGroup && (
                    <div className="description-container">
                        <Description
                            title="あらすじ"
                            content={[
                            'ここに企画の説明が入ります。企画の内容や目的、参加方法などを詳しく説明します。',
                            '例えば、スタンプラリーでは、参加者が指定された場所を訪れてスタンプを集めることで、特典を得ることができます。',
                            'また、工科展では、学生たちの研究やプロジェクトを展示し、来場者に技術やアイデアを紹介します。',
                            '各企画の詳細は、公式ウェブサイトやSNSで随時更新されますので、ぜひチェックしてください！'
                            ]}
                        />
                        <Description
                            title="ルール説明"
                            content={[
                            '参加者は、指定された時間内に集合してください。',
                            '遅刻や無断キャンセルはご遠慮ください。',
                            '詳細は公式ウェブサイトをご確認ください。'
                            ]}
                            image={descriptionImage} // 画像のURLを指定
                        />
                        <Description
                            title="注意事項"
                            content={[
                            '参加希望者は、事前に公式ウェブサイトから申し込みを行ってください。',
                            '定員に達し次第、受付を終了しますのでお早めに！'
                            ]}
                        />
                        <div className="desription-button-group">
                            <div className="button-row">
                                <button 
                                    className="full-width-button" 
                                    onClick={() => setShowGroup(!showGroup)}>
                                        待ち時間表示
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketQuePage;